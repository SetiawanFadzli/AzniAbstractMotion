# AzniAbstractMotion 🎬✨
**4K Abstract Gradient Motion Graphic Generator for Microstock Creators (Adobe Stock & Shutterstock)**

Aplikasi web modern berbasis WebGL dan WebCodecs hardware acceleration untuk membuat video latar belakang motion graphic gradasi abstrak berkualitas komersial tinggi hingga resolusi **4K UHD (3840×2160)** dengan durasi fleksibel hingga **10 detik**.

---

## 🌟 Fitur Utama

1. **Multi-Color Gradient Mesh System (2 hingga 10 Warna)**:
   - Pilih dan kombinasikan hingga **maksimal 10 warna** secara bebas.
   - Color picker interaktif, hex code input, drag reorder stop warna, dan fitur hapus/tambah stop.
   - **Preset Palet Trending Microstock**: 10 palet warna populer kurasi pasar stock (*Cyberpunk Aurora, Sunset Horizon Silk, Deep Oceanic Biolum, Holographic Iridescent, Luxury Velvet & Amber*, dll.).
   - Generator **Harmoni Warna Acak** dengan teori harmoni warna (Monokromatik, Komplementer, Triadik).

2. **2 Template Gerakan Motion Komersial**:
   - **Template 1: Silk Aurora Wave (Mesh Flow)**:
     - Gelombang satin/sutera multidimensional dengan domain warping fraktal.
     - Menghasilkan lekukan cahaya dinamis yang mewah dan lembut.
   - **Template 2: Organic Liquid Blobs (Radial Warp)**:
     - Metaball cair organik yang bergerak harmonik dan saling melebur dengan difusi kromatik.
     - Gaya wallpaper modern Apple / fluid tech wallpaper yang sangat diminati pembeli stock footage.

3. **Kontrol Parameter Motion Interaktif**:
   - **Kecepatan Motion** (0.2x – 3.0x).
   - **Tingkat Turbulensi / Distorsi** (0.2 – 3.0).
   - **Skala & Kerapatan Gelombang** (0.5x – 2.5x).
   - **Arah Aliran / Sudut Putaran** (0° – 360°).
   - **Anti-Banding Dithering & Film Grain**: Fitur esensial untuk mencegah *color banding* pada kompresi video 8-bit MP4, meloloskan video dari penolakan inspeksi kurator Adobe Stock & Shutterstock.
   - **Seamless Loop 100%**: Gerakan berulang matematis tanpa jeda loncatan (0-seam), fitur paling dicari oleh pembeli footage.

4. **Mesin Ekspor Video 4K MP4**:
   - **Resolusi**:
     - 4K UHD (3840 × 2160) 16:9 Landscape (Standar Microstock).
     - 4K Vertikal (2160 × 3840) 9:16 (Reels / TikTok Stock Footage).
     - Full HD (1920 × 1080).
   - **Durasi Video**: 1 hingga 10 detik (Rekomendasi 5s, 8s, 10s).
   - **Frame Rate**: 30 FPS atau 60 FPS (Ultra Smooth).
   - **Bitrate**: 35–40 Mbps High Bitrate H.264 AVC (*Microstock Master Quality*).
   - **WebCodecs + MP4-Muxer Engine**: Rendering frame-accurate offline langsung di browser dengan akselerasi GPU perangkat keras, menghasilkan file `.mp4` asli siap jual.
   - **Foto 4K Still Snapshot**: Tombol download 1-klik untuk mengekspor gambar still PNG 4K UHD beresolusi penuh agar dapat dijual juga sebagai aset gambar latar belakang.
---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dibangun dengan Vite, React 19, TypeScript, dan Tailwind CSS.

### 1. Jalankan Mode Development:
```bash
npm run dev
```
Buka browser pada alamat yang tertera (biasanya `http://localhost:5173`).

### 2. Jalankan Mode Preview Hasil Build:
```bash
npm run build
npm run preview
```

---

## 💡 Panduan Upload ke Microstock

1. **Adobe Stock**:
   - Format: MP4 (H.264).
   - Resolusi: 4K UHD (3840×2160) menghasilkan pendapatan royalti tertinggi.
   - Tandai kategori: *Backgrounds / Technology / Abstract*.
   - Cantumkan kata kunci `4k`, `seamless loop`, `abstract gradient`, `background`, `motion graphics`.

2. **Shutterstock**:
   - Format: MP4 (H.264).
   - Jangan menyertakan audio track jika berupa background video.
   - Copy dan paste seluruh 50 tag yang telah digenerate aplikasi ke formulir tagging Shutterstock.
