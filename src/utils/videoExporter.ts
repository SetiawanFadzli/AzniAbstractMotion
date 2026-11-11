import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { WebGLGradientRenderer, type RenderParams } from './webglRenderer';


export interface ExportOptions {
  width: number;
  height: number;
  fps: number;
  duration: number; // In seconds, max 10
  bitrate?: number; // In bps
  params: RenderParams;
  onProgress?: (progress: ExportProgress) => void;
  signal?: AbortSignal;
}

export interface ExportProgress {
  currentFrame: number;
  totalFrames: number;
  percent: number;
  renderedFps: number;
  elapsedTime: number;
  remainingTime: number;
  stage: 'rendering' | 'encoding' | 'finalizing' | 'completed';
}

export class VideoExportManager {
  /**
   * Check if WebCodecs VideoEncoder is available in the current browser
   */
  public static isWebCodecsSupported(): boolean {
    return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
  }

  /**
   * Find the best supported H.264 codec string for the target resolution
   */
  public static async getSupportedCodec(width: number, height: number, fps: number): Promise<string> {
    if (!VideoExportManager.isWebCodecsSupported()) {
      throw new Error('WebCodecs is not supported in this browser.');
    }

    // Try candidates in order: High Profile Level 5.2 (best for 4K), 5.1, Main Profile, Baseline
    const candidates = [
      'avc1.640034', // High Profile, Level 5.2 (4K 60fps)
      'avc1.640033', // High Profile, Level 5.1 (4K 30fps)
      'avc1.4d0034', // Main Profile, Level 5.2
      'avc1.4d0033', // Main Profile, Level 5.1
      'avc1.420034', // Baseline, Level 5.2
      'avc1.42001f', // Baseline, Level 3.1
    ];

    for (const codec of candidates) {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec,
          width,
          height,
          bitrate: 35_000_000,
          framerate: fps,
        });
        if (support.supported) {
          return codec;
        }
      } catch {
        // Continue trying
      }
    }

    // Default fallback
    return 'avc1.640033';
  }

  /**
   * Renders the gradient animation frame-by-frame and muxes into an MP4 blob
   */
  public static async exportToMp4(options: ExportOptions): Promise<Blob> {
    const {
      width,
      height,
      fps,
      duration,
      params,
      onProgress,
      signal,
    } = options;

    if (!VideoExportManager.isWebCodecsSupported()) {
      throw new Error(
        'Browser Anda tidak mendukung WebCodecs API untuk ekspor offline frame-accurate. Disarankan menggunakan Google Chrome, Microsoft Edge, atau browser berbasis Chromium terbaru.'
      );
    }

    const totalFrames = Math.round(duration * fps);
    const targetBitrate = options.bitrate || (width >= 3840 ? 35_000_000 : 15_000_000); // 35 Mbps for 4K, 15 Mbps for FHD

    // Create offscreen canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const renderer = new WebGLGradientRenderer(canvas);

    // Find best codec
    const codec = await VideoExportManager.getSupportedCodec(width, height, fps);

    // Initialize mp4-muxer
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: 'avc',
        width,
        height,
      },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset',
    });

    let encoderError: Error | null = null;

    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
      },
      error: (e) => {
        console.error('VideoEncoder error:', e);
        encoderError = e;
      },
    });

    videoEncoder.configure({
      codec,
      width,
      height,
      bitrate: targetBitrate,
      framerate: fps,
      bitrateMode: 'variable',
    });

    const startTime = performance.now();
    let lastTimeCheck = startTime;
    let framesRenderedSinceLast = 0;
    let currentFps = 0;

    try {
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        if (signal?.aborted) {
          throw new DOMException('Export dibatalkan oleh pengguna.', 'AbortError');
        }
        if (encoderError) {
          throw encoderError;
        }

        // Exact time for this frame
        const frameTime = (frameIndex / fps);
        const frameParams = {
          ...params,
          time: frameTime,
          duration: duration,
        };

        // Render WebGL frame
        renderer.render(frameParams, width, height);

        // Microsecond timestamp for WebCodecs
        const timestamp = Math.round((frameIndex / fps) * 1_000_000);
        const frameDuration = Math.round((1 / fps) * 1_000_000);

        const videoFrame = new VideoFrame(canvas, {
          timestamp,
          duration: frameDuration,
        });

        // Insert keyframe every 2 seconds or on first frame
        const isKeyFrame = frameIndex % (fps * 2) === 0;
        videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
        videoFrame.close();

        // Control memory backlog: wait if encoder queue is backed up
        if (videoEncoder.encodeQueueSize > 4) {
          await new Promise<void>((resolve) => {
            const check = () => {
              if (videoEncoder.encodeQueueSize <= 2) {
                resolve();
              } else {
                setTimeout(check, 10);
              }
            };
            check();
          });
        }

        // Progress telemetry calculation
        framesRenderedSinceLast++;
        const now = performance.now();
        if (now - lastTimeCheck >= 300 || frameIndex === totalFrames - 1) {
          currentFps = (framesRenderedSinceLast / (now - lastTimeCheck)) * 1000;
          framesRenderedSinceLast = 0;
          lastTimeCheck = now;

          const elapsedSec = (now - startTime) / 1000;
          const percent = ((frameIndex + 1) / totalFrames) * 100;
          const remainingSec = currentFps > 0 ? (totalFrames - (frameIndex + 1)) / currentFps : 0;

          if (onProgress) {
            onProgress({
              currentFrame: frameIndex + 1,
              totalFrames,
              percent,
              renderedFps: currentFps,
              elapsedTime: elapsedSec,
              remainingTime: remainingSec,
              stage: 'rendering',
            });
          }
        }
      }

      if (onProgress) {
        onProgress({
          currentFrame: totalFrames,
          totalFrames,
          percent: 99,
          renderedFps: currentFps,
          elapsedTime: (performance.now() - startTime) / 1000,
          remainingTime: 0,
          stage: 'finalizing',
        });
      }

      await videoEncoder.flush();
      muxer.finalize();

      const buffer = muxer.target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });

      if (onProgress) {
        onProgress({
          currentFrame: totalFrames,
          totalFrames,
          percent: 100,
          renderedFps: currentFps,
          elapsedTime: (performance.now() - startTime) / 1000,
          remainingTime: 0,
          stage: 'completed',
        });
      }

      return blob;
    } finally {
      videoEncoder.close();
      renderer.destroy();
    }
  }

  /**
   * Export a single 4K still frame as high-resolution PNG
   */
  public static exportStillImage(
    params: RenderParams,
    width: number,
    height: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const renderer = new WebGLGradientRenderer(canvas);
      renderer.render(params, width, height);

      canvas.toBlob(
        (blob) => {
          renderer.destroy();
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Gagal mengekspor gambar'));
          }
        },
        'image/png',
        1.0
      );
    });
  }
}
