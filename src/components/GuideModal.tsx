import React from 'react';
import { X, CheckCircle2, ShieldCheck, DollarSign, Sparkles, BookOpen } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-emerald-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#f9faf8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Panduan Sukses Jual Video di Adobe Stock & Shutterstock
              </h2>
              <p className="text-xs text-slate-500">
                Tips Kurasi & Standar Teknis Lolos Reviewer Microstock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh] text-xs leading-relaxed text-slate-600">
          {/* Why Abstract Gradient sells like crazy */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Mengapa Video Abstract Gradient 4K Sangat Laris?</span>
            </div>
            <p className="text-slate-700">
              Video latar belakang (background backdrop) gradasi abstract adalah salah satu kategori evergreen dengan volume penjualan tertinggi di microstock. Video ini digunakan oleh jutaan desainer untuk:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
              <li>Latar presentasi korporat & pitch deck modern bergaya Apple/Google.</li>
              <li>Intro & backdrop YouTube / Video Podcast / Webinar.</li>
              <li>Iklan promosi produk, website hero banner & billboard LED digital.</li>
              <li>Lisensi video 4K berharga jauh lebih tinggi daripada foto ($60 - $200+ per download).</li>
            </ul>
          </div>

          {/* Technical Specs Guide */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Spesifikasi Wajib Microstock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#f9faf8] border border-slate-200/90 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolusi 4K UHD (3840×2160)
                </span>
                <p className="text-slate-500 text-[11px]">
                  Pembeli stock hampir selalu mencari resolusi 4K untuk masa depan. Aplikasi ini mengekspor pixel-perfect 3840×2160 tanpa upscaling artifisial.
                </p>
              </div>

              <div className="bg-[#f9faf8] border border-slate-200/90 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Durasi 5 – 10 Detik
                </span>
                <p className="text-slate-500 text-[11px]">
                  Adobe Stock dan Shutterstock memiliki batas durasi optimal untuk stock footage (biasanya 5–30 detik). Durasi 5s atau 10s adalah durasi emas paling optimal.
                </p>
              </div>

              <div className="bg-[#f9faf8] border border-slate-200/90 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Seamless Loop (0 Seam)
                </span>
                <p className="text-slate-500 text-[11px]">
                  Sertakan kata kunci "Seamless Loop" pada judul dan tag. Video yang berulang tanpa jeda akan diprioritaskan oleh algoritma pencarian stock.
                </p>
              </div>

              <div className="bg-[#f9faf8] border border-slate-200/90 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Anti-Banding Dithering
                </span>
                <p className="text-slate-500 text-[11px]">
                  Alasan nomor 1 video gradasi ditolak kurator adalah "Artifacting / Banding lines". Fitur Anti-Banding di aplikasi ini menambahkan film grain mikro untuk mengaburkan undakan warna.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Upload Workflow */}
          <div className="bg-[#f9faf8] border border-slate-200/90 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Alur Cepat Produksi Asset
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>Pilih template (Silk Aurora Wave atau Organic Liquid Blobs).</li>
              <li>Pilih palet warna (atur hingga 10 warna atau gunakan preset trending).</li>
              <li>Klik <strong className="text-slate-800">Export 4K MP4</strong> dan tunggu render selesai (file otomatis terdownload).</li>
              <li>(Opsional) Klik tombol <strong className="text-slate-800">Foto 4K</strong> untuk mengunduh versi Still PNG agar bisa dijual juga sebagai asset gambar!</li>
              <li>Upload file MP4 ke Adobe Stock / Shutterstock (pilih opsi <em>Not AI</em> karena dihasilkan secara prosedural kode).</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-[#f9faf8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
