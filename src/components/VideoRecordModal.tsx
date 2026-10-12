import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Video,
  Camera,
  Play,
  Pause,
  Upload,
  RefreshCw,
  MapPin,
  Check,
  AlertTriangle,
  Send,
  Sparkles,
  SwitchCamera
} from 'lucide-react';
import { IncidentLocation, ReportCategory } from '../types';
import { PRESET_LOCATIONS } from '../mockData';

interface VideoRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVideo: (data: {
    videoUrl?: string;
    caption: string;
    category: ReportCategory;
    location: IncidentLocation;
    duration: string;
    keepInFeed?: boolean;
  }) => void;
  onNotification?: (msg: string) => void;
}

const PRESET_VIDEOS = [
  {
    name: 'Câmera Tráfego Paulista',
    desc: 'Fluxo intenso sentido Consolação · Monitoramento 24h',
    category: 'transito' as ReportCategory,
    duration: '00:24',
    location: PRESET_LOCATIONS[0],
  },
  {
    name: 'Patrulha Augusta / Santos',
    desc: 'Viaduto e cruzamento sob fiscalização ativa',
    category: 'ocorrencia' as ReportCategory,
    duration: '00:35',
    location: PRESET_LOCATIONS[1],
  },
  {
    name: 'Radar Radial Leste',
    desc: 'Trecho livre com lentidão pontual no semáforo',
    category: 'transito' as ReportCategory,
    duration: '00:18',
    location: PRESET_LOCATIONS[3],
  },
];

export const VideoRecordModal: React.FC<VideoRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmitVideo,
  onNotification,
}) => {
  const [mode, setMode] = useState<'options' | 'live' | 'preview'>('options');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoDurationFormatted, setVideoDurationFormatted] = useState('00:24');
  const [caption, setCaption] = useState('Registro em vídeo gravado via celular na central de monitoramento.');
  const [category, setCategory] = useState<ReportCategory>('transito');
  const [location, setLocation] = useState<IncidentLocation>(PRESET_LOCATIONS[0]);
  const [keepInFeed, setKeepInFeed] = useState<boolean>(true);

  // Live recording state
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  const [liveDurationSec, setLiveDurationSec] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Close & cleanup
  const stopLiveStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecordingLive(false);
    setLiveDurationSec(0);
  };

  const handleClose = () => {
    stopLiveStream();
    setMode('options');
    setRecordedVideoUrl(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveStream();
      setMode('options');
      setRecordedVideoUrl(null);
    }
  }, [isOpen]);

  // Start live in-app camera
  const startLiveCamera = async () => {
    setMode('live');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (onNotification) onNotification('Câmera direta ativada no seu navegador.');
        nativeCameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
    } catch {
      // Fallback directly to native device camera on Android/iOS
      if (onNotification) onNotification('Abrindo aplicativo de câmera do celular...');
      nativeCameraInputRef.current?.click();
    }
  };

  // Flip camera between front and back
  const handleFlipCamera = async () => {
    stopLiveStream();
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextFacing },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
    } catch {
      // fallback
    }
  };

  // Toggle live record start/stop
  const handleToggleLiveRecord = () => {
    if (!isRecordingLive) {
      // Start recording
      if (!mediaStreamRef.current) return;
      recordedChunksRef.current = [];

      try {
        const recorder = new MediaRecorder(mediaStreamRef.current);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          const mins = Math.floor(liveDurationSec / 60);
          const secs = liveDurationSec % 60;
          setVideoDurationFormatted(
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          );
          stopLiveStream();
          setMode('preview');
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecordingLive(true);
        setLiveDurationSec(0);
      } catch {
        // Fallback
        nativeCameraInputRef.current?.click();
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingLive(false);
    }
  };

  // Live timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingLive) {
      timer = setInterval(() => {
        setLiveDurationSec((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingLive]);

  // Handle native mobile video file selected from device camera or gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setRecordedVideoUrl(objectUrl);
      setVideoDurationFormatted('00:20');
      stopLiveStream();
      setMode('preview');
      if (onNotification) onNotification('Vídeo capturado com sucesso pelo celular!');
    }
  };

  // Select a preset video
  const handleSelectPreset = (preset: typeof PRESET_VIDEOS[0]) => {
    setCaption(preset.desc);
    setCategory(preset.category);
    setLocation(preset.location);
    setVideoDurationFormatted(preset.duration);
    setRecordedVideoUrl(null); // uses tactical CCTV simulation
    setMode('preview');
  };

  // Final submit
  const handleConfirmSubmit = () => {
    // Provide a valid playable video stream if no custom blob was recorded
    const finalVideoUrl =
      recordedVideoUrl ||
      'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-4155-large.mp4';

    onSubmitVideo({
      videoUrl: finalVideoUrl,
      caption: caption.trim() || 'Vídeo registrado no local.',
      category,
      location,
      duration: videoDurationFormatted,
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
        {/* Hidden HTML5 Native Camera Input with capture="environment" */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Hidden Gallery Input */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Filmar com o Celular</h3>
              <p className="text-[11px] text-neutral-400">Compatível com todos Android e iOS 15, 16, 17, 18</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: OPTIONS MODE */}
        {mode === 'options' && (
          <div className="space-y-3">
            {/* Direct Camera Button (Recommended for Mobile) */}
            <button
              onClick={() => nativeCameraInputRef.current?.click()}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-neutral-950 font-extrabold text-sm flex items-center justify-between shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-neutral-950 text-sm font-bold">Abrir Câmera de Vídeo do Celular</div>
                  <div className="text-emerald-950 text-xs font-medium">Filma direto no aplicativo nativo da câmera</div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-neutral-950 shrink-0" />
            </button>

            {/* In-App Live Camera Button */}
            <button
              onClick={startLiveCamera}
              className="w-full p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left flex items-center gap-3 transition-colors active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-200">Gravação de Vídeo na Tela</div>
                <div className="text-[11px] text-neutral-400">Visor com contador e botão REC direto na página</div>
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
                <div className="text-xs font-bold text-neutral-200">Escolher Vídeo Salvo na Galeria</div>
                <div className="text-[11px] text-neutral-400">Envie um arquivo de vídeo do seu dispositivo</div>
              </div>
            </button>

            {/* Presets */}
            <div className="pt-2">
              <span className="text-xs text-neutral-400 font-semibold mb-2 block">
                Ou use uma Câmera Operacional rápida:
              </span>
              <div className="space-y-1.5">
                {PRESET_VIDEOS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectPreset(p)}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-emerald-400">{p.name}</div>
                      <div className="text-[10px] text-neutral-400">{p.desc}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                      {p.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LIVE CAMERA IN-APP VIEW */}
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

              {/* REC Badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-xl border border-neutral-700 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isRecordingLive ? 'bg-red-500 animate-ping' : 'bg-neutral-500'
                  }`}
                />
                <span className="text-xs font-mono font-bold text-white">
                  {isRecordingLive
                    ? `REC ${Math.floor(liveDurationSec / 60)
                        .toString()
                        .padStart(2, '0')}:${(liveDurationSec % 60)
                        .toString()
                        .padStart(2, '0')}`
                    : 'PRONTO PARA GRAVAR'}
                </span>
              </div>

              {/* Flip camera */}
              <button
                onClick={handleFlipCamera}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-neutral-700 transition-colors"
                title="Alternar câmera frontal / traseira"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              {/* Center Recording Control Button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={handleToggleLiveRecord}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-2xl transition-transform active:scale-95 ${
                    isRecordingLive
                      ? 'bg-red-500 hover:bg-red-400 text-white ring-4 ring-red-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 ring-4 ring-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isRecordingLive ? 'bg-white' : 'bg-red-600'
                    }`}
                  />
                  <span>{isRecordingLive ? 'Parar e Concluir' : 'Iniciar Gravação'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                stopLiveStream();
                setMode('options');
              }}
              className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition-colors"
            >
              Voltar às opções
            </button>
          </div>
        )}

        {/* STEP 3: PREVIEW & CONFIRM FORM */}
        {mode === 'preview' && (
          <div className="space-y-3">
            {/* Video preview surface */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center">
              {recordedVideoUrl ? (
                <video
                  src={recordedVideoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <Video className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-xs font-bold text-white">Vídeo Operacional Selecionado</span>
                  <div className="text-[11px] text-emerald-400 font-mono">Duração: {videoDurationFormatted}</div>
                </div>
              )}
            </div>

            {/* Change video button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('options')}
                className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Trocar ou regravar vídeo</span>
              </button>

              <span className="text-xs text-emerald-400 font-mono font-bold">
                {videoDurationFormatted}
              </span>
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
                Descrição do Vídeo
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                placeholder="Descreva o que foi gravado..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Location selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Localização no Mapa (GPS)
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

            {/* Opção explícita de deixar filmagem no feed */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-black text-white block">Deixar Vídeo no Feed</span>
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
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar Vídeo no Feed (24h)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
