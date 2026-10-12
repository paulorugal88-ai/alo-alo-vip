import React, { useState } from 'react';
import {
  X,
  Send,
  Video,
  Camera,
  Mic,
  FileText,
  MapPin,
  AlertTriangle,
  Car,
  Info,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { IncidentLocation, ReportCategory } from '../types';
import { PRESET_LOCATIONS } from '../mockData';

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitText: (data: {
    content: string;
    category: ReportCategory;
    location: IncidentLocation;
  }) => void;
  onOpenVideo: () => void;
  onOpenPhoto: () => void;
  onOpenAudio: () => void;
}

export const QuickReportModal: React.FC<QuickReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitText,
  onOpenVideo,
  onOpenPhoto,
  onOpenAudio,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ReportCategory>('transito');
  const [location, setLocation] = useState<IncidentLocation>(PRESET_LOCATIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmitText({
      content: content.trim(),
      category,
      location,
    });
    setContent('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Novo Reporte na Central</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  24H
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">Publicação imediata no feed de 24 horas para todos os membros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Quick Media Shortcut Cards */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenVideo();
            }}
            className="p-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 flex flex-col items-center gap-1.5 transition-all hover:border-emerald-500 group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">Filmar</span>
            <span className="text-[10px] text-neutral-500">Com celular</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPhoto();
            }}
            className="p-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 flex flex-col items-center gap-1.5 transition-all hover:border-emerald-500 group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">Tirar Foto</span>
            <span className="text-[10px] text-neutral-500">Câmera nativa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAudio();
            }}
            className="p-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 flex flex-col items-center gap-1.5 transition-all hover:border-emerald-500 group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">Gravar Áudio</span>
            <span className="text-[10px] text-neutral-500">Voz ao vivo</span>
          </button>
        </div>

        {/* Text Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Tipo de Ocorrência
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'transito' as ReportCategory, label: 'Trânsito' },
                { id: 'alerta' as ReportCategory, label: 'Alerta' },
                { id: 'ocorrencia' as ReportCategory, label: 'Ocorrência' },
                { id: 'informacao' as ReportCategory, label: 'Info' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === c.id
                      ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Escrever Reporte
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Digite o que está acontecendo no local..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Ponto no Mapa (GPS)
            </label>
            <select
              value={location.name}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                if (found) setLocation(found);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 disabled:opacity-40 text-neutral-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar no Feed (24h)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
