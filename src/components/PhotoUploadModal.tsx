import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Check,
  MapPin,
  Sparkles,
  RotateCw,
  SwitchCamera,
  Image as ImageIcon,
  Send,
  RefreshCw
} from 'lucide-react';
import { IncidentLocation, ReportCategory } from '../types';
import { PRESET_LOCATIONS } from '../mockData';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPhoto: (data: {
    imageUrl: string;
    caption: string;
    category: ReportCategory;
    location: IncidentLocation;
    keepInFeed?: boolean;
  }) => void;
  onNotification?: (msg: string) => void;
}

const PRESET_PHOTOS = [
  {
    name: 'Tráfego Intenso',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    category: 'transito' as ReportCategory,
  },
  {
    name: 'Câmera Operacional',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
    category: 'ocorrencia' as ReportCategory,
  },
  {
    name: 'Viaduto / Rotas',
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=80',
    category: 'transito' as ReportCategory,
  },
  {
    name: 'Perímetro Central',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    category: 'alerta' as ReportCategory,
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitPhoto,
  onNotification,
}) => {
  const [mode, setMode] = useState<'options' | 'live' | 'preview'>('options');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(PRESET_PHOTOS[0].url);
  const [rotation, setRotation] = useState(0);
  const [caption, setCaption] = useState('Registro fotográfico enviado para verificação pela central.');
  const [category, setCategory] = useState<ReportCategory>('transito');
  const [location, setLocation] = useState<IncidentLocation>(PRESET_LOCATIONS[0]);
  const [keepInFeed, setKeepInFeed] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);

  const stopLiveCamera = () => {
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach((track) => track.stop());
      liveStreamRef.current = null;
    }
  };

  const handleClose = () => {
    stopLiveCamera();
    setMode('options');
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
      setMode('options');
    }
  }, [isOpen]);

  // Start live in-app camera viewfinder
  const startLiveCamera = async () => {
    setMode('live');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        nativeCameraInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      liveStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
    } catch {
      nativeCameraInputRef.current?.click();
    }
  };

  // Flip camera between front & back
  const handleFlipCamera = async () => {
    stopLiveCamera();
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextFacing },
      });
      liveStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
    } catch {
      // fallback
    }
  };

  // Snap photo from live viewfinder
  const handleTakeSnapshot = () => {
    const video = liveVideoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedPhoto(dataUrl);
      stopLiveCamera();
      setMode('preview');
      if (onNotification) onNotification('Foto capturada com sucesso!');
    }
  };

  // Handle native camera or file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
          stopLiveCamera();
          setMode('preview');
          if (onNotification) onNotification('Foto carregada do celular!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let finalPhoto = selectedPhoto;
    try {
      if (finalPhoto && finalPhoto.startsWith('data:image')) {
        const { optimizeImageDataUrl } = await import('../utils/imageOptimizer');
        finalPhoto = await optimizeImageDataUrl(finalPhoto, 900, 900, 0.75);
      }
    } catch {
      // keep original
    }
    onSubmitPhoto({
      imageUrl: finalPhoto,
      caption: caption.trim() || 'Foto registrada no perímetro.',
      category,
      location,
      keepInFeed,
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Native Camera Input with capture="environment" for iOS 1-18 and Android */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Hidden Gallery Input */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tirar Foto com o Celular</h3>
              <p className="text-[11px] text-neutral-400">Roda em todos os Androids e iOS 15, 16, 17, 18</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE 1: OPTIONS / SELECTION */}
        {mode === 'options' && (
          <div className="space-y-3">
            {/* Direct Phone Camera Button */}
            <button
              onClick={() => nativeCameraInputRef.current?.click()}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-neutral-950 font-extrabold text-sm flex items-center justify-between shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-neutral-950 text-sm font-bold">Fotografar com a Câmera do Celular</div>
                  <div className="text-emerald-950 text-xs font-medium">Abre a câmera nativa do iPhone ou Android</div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-neutral-950 shrink-0" />
            </button>

            {/* In-App Live Camera */}
            <button
              onClick={startLiveCamera}
              className="w-full p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left flex items-center gap-3 transition-colors active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-200">Câmera ao Vivo na Tela</div>
                <div className="text-[11px] text-neutral-400">Visor com botão de disparo na página</div>
              </div>
            </button>

            {/* Gallery Upload */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left flex items-center gap-3 transition-colors active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-200">Escolher Foto da Galeria</div>
                <div className="text-[11px] text-neutral-400">Carregar arquivo de imagem salvo</div>
              </div>
            </button>

            {/* Preset Photos */}
            <div className="pt-2">
              <span className="text-xs text-neutral-400 font-semibold mb-2 block">
                Ou selecione uma foto pronta da central:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(p.url);
                      setCategory(p.category);
                      setMode('preview');
                    }}
                    className="relative h-16 rounded-xl overflow-hidden border border-neutral-800 hover:border-emerald-500 transition-all hover:scale-105"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: LIVE CAMERA VIEWFINDER */}
        {mode === 'live' && (
          <div className="space-y-3">
            <div className="relative h-60 bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <video
                ref={liveVideoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Flip camera */}
              <button
                onClick={handleFlipCamera}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-neutral-700 transition-colors"
                title="Alternar câmera frontal / traseira"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              {/* Shutter snapshot button */}
              <button
                onClick={handleTakeSnapshot}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-2xl ring-4 ring-emerald-500/50 hover:scale-110 active:scale-95 transition-transform"
                title="Capturar Foto Agora"
              >
                <div className="w-10 h-10 rounded-full border-2 border-neutral-950 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-neutral-950" />
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                stopLiveCamera();
                setMode('options');
              }}
              className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition-colors"
            >
              Voltar às opções
            </button>
          </div>
        )}

        {/* MODE 3: PREVIEW & CONFIRM FORM */}
        {mode === 'preview' && (
          <div className="space-y-3">
            {/* Selected Image Preview with Rotation */}
            <div className="relative h-48 rounded-2xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center group">
              <img
                src={selectedPhoto}
                alt="Preview"
                style={{ transform: `rotate(${rotation}deg)` }}
                className="w-full h-full object-cover transition-transform duration-200"
              />

              {/* Rotate and Replace Overlays */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white border border-neutral-700 transition-colors"
                  title="Girar foto"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={() => setMode('options')}
                  className="pointer-events-auto px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-semibold border border-neutral-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Trocar foto</span>
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Categoria do Reporte
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

            {/* Caption */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Legenda / Relato da Foto
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Descreva o que está na foto..."
              />
            </div>

            {/* Location selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Localização (GPS no mapa)
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

            {/* Opção explícita de deixar no feed */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-black text-white block">Deixar Foto no Feed</span>
                  <span className="text-[10px] text-emerald-300 font-medium">Permanece publicado 24h para todos os membros</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepInFeed}
                  onChange={(e) => setKeepInFeed(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-bold hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Publicar Foto no Feed (24h)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
