import React, { useState } from 'react';
import {
  X,
  MapPin,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { FeedMessage } from '../types';

interface PhotoViewerModalProps {
  message: FeedMessage | null;
  onClose: () => void;
  onNavigateToMap?: (message: FeedMessage) => void;
  onNotification?: (msg: string) => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  message,
  onClose,
  onNavigateToMap,
  onNotification,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!message || (!message.mediaUrl && message.type !== 'photo')) return null;

  const imgSrc =
    message.mediaUrl ||
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&auto=format&fit=crop&q=80';

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = `foto-reporte-${message.id}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onNotification) onNotification('Foto baixada com sucesso!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Reporte de ${message.authorName}`,
        text: message.content,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      if (onNotification) onNotification('Link copiado para a área de transferência.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[95vh] bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2.5">
            <img
              src={message.authorAvatar}
              alt={message.authorName}
              className="w-8 h-8 rounded-full object-cover border border-emerald-500"
            />
            <div>
              <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                <span>{message.authorName}</span>
                <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                  {message.categoryLabel}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                {message.timeAgo} · {message.timestamp}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Girar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-400 transition-colors"
              title="Baixar imagem"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-400 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-rose-400 transition-colors"
              title="Fechar visualizador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Image Viewer Surface with Zoom and Rotation */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[50vh] max-h-[65vh] overflow-hidden">
          <div
            className="transition-transform duration-200 ease-out flex items-center justify-center w-full h-full"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={imgSrc}
              alt={message.content}
              className="max-w-full max-h-[62vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Reset button if zoomed or rotated */}
          {(zoom !== 1 || rotation !== 0) && (
            <button
              onClick={handleReset}
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/70 border border-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 backdrop-blur hover:text-white"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Redefinir</span>
            </button>
          )}
        </div>

        {/* Bottom Details Bar */}
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 text-xs space-y-2">
          {message.location && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{message.location.name}</span>
              </div>

              {onNavigateToMap && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToMap(message);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-semibold flex items-center gap-1"
                >
                  <span>Ver no Mapa GPS</span>
                </button>
              )}
            </div>
          )}

          <p className="text-neutral-200 leading-relaxed font-sans">{message.content}</p>
        </div>
      </div>
    </div>
  );
};
