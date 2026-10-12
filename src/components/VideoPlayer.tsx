import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Video as VideoIcon,
  Download,
  Share2,
  FastForward,
  X
} from 'lucide-react';
import { audioSynthesizer } from '../utils/audioSynthesizer';

interface VideoPlayerProps {
  videoUrl?: string;
  duration?: string;
  title?: string;
  locationName?: string;
  onNotification?: (msg: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  duration = '00:24',
  title = 'Registro em Vídeo · Perímetro Verificado',
  locationName = 'Rua Alameda x Augusta',
  onNotification,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(24);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isRealVideo = Boolean(videoUrl);

  // Play / Pause toggle
  const togglePlay = () => {
    if (isRealVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      // Synthetic canvas video toggle
      if (isPlaying) {
        setIsPlaying(false);
        audioSynthesizer.stop();
      } else {
        setIsPlaying(true);
        audioSynthesizer.playRadioBeep();
      }
    }
  };

  // Synchronize HTML5 video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setTotalDuration(Math.round(video.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isRealVideo]);

  // Apply playback speed and volume to HTML5 video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, isMuted, volume]);

  // Synthetic timer progression (if not real video)
  useEffect(() => {
    if (isRealVideo) return;
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRealVideo, totalDuration, playbackSpeed]);

  // Synthetic canvas CCTV animation
  useEffect(() => {
    if (isRealVideo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    const render = () => {
      ctx.fillStyle = '#0a100d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road perspective
      ctx.fillStyle = '#161e19';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.2, canvas.height);
      ctx.lineTo(canvas.width * 0.45, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.8, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Road dashed line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.5, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated surveillance scanline
      const scanY = (offset * 1.5) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      // Car box
      const carProgress = ((offset * 0.8) % 100) / 100;
      const carX = canvas.width * 0.35 + carProgress * (canvas.width * 0.25);
      const carY = canvas.height * 0.38 + carProgress * (canvas.height * 0.5);
      const carW = 22 + carProgress * 35;
      const carH = 14 + carProgress * 22;

      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(carX, carY, carW, carH);

      ctx.fillStyle = '#00e676';
      ctx.font = '10px monospace';
      ctx.fillText(`VEÍCULO #${Math.floor(carProgress * 80) + 10} [AO VIVO]`, carX - 10, carY - 4);

      if (isPlaying) {
        offset += 2 * playbackSpeed;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isRealVideo, playbackSpeed]);

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Scrub bar change
  const handleSeek = (newVal: number) => {
    setCurrentTime(newVal);
    if (isRealVideo && videoRef.current) {
      videoRef.current.currentTime = newVal;
    }
  };

  // Cycle speed: 1x -> 1.5x -> 2x
  const handleToggleSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (onNotification) {
      onNotification(`Velocidade de vídeo: ${nextSpeed}x`);
    }
  };

  // Restart video
  const handleRestart = () => {
    setCurrentTime(0);
    if (isRealVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Download video
  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video-reporte-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (onNotification) onNotification('Vídeo baixado para o dispositivo.');
    } else {
      if (onNotification) onNotification('Download simulado: gravação de patrulha 24h.');
    }
  };

  // Share video
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Registro de vídeo na central: ${locationName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      if (onNotification) onNotification('Link do vídeo copiado para a área de transferência.');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`my-2 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 flex flex-col justify-between max-w-full m-0 rounded-none' : ''
      }`}
    >
      {/* Top CCTV Overlay */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-neutral-950/85 px-2.5 py-1 rounded-xl border border-neutral-800 backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-neutral-500'}`} />
          <span className="font-bold text-white tracking-wider">
            {isRealVideo ? 'VÍDEO REGISTRADO' : 'CÂMERA PATRULHA'}
          </span>
          <span className="text-emerald-400">· {locationName}</span>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-1 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
            title="Baixar vídeo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-1 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
            title="Compartilhar"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-1 rounded-lg bg-neutral-950/80 text-white hover:text-rose-400 border border-neutral-800"
              title="Sair de tela cheia"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Video Content Viewport */}
      <div
        className="relative h-52 sm:h-64 w-full bg-black flex items-center justify-center cursor-pointer group select-none"
        onClick={togglePlay}
      >
        {isRealVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />
        )}

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shadow-xl shadow-emerald-500/40 group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Functional Video Control Bar */}
      <div className="p-2.5 bg-neutral-900/95 border-t border-neutral-800 flex flex-col gap-1.5 z-20">
        {/* Scrubber track */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={totalDuration || 24}
            step="0.5"
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 transition-colors"
              title={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Replay button */}
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="Voltar ao início"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed toggle button */}
            <button
              onClick={handleToggleSpeed}
              className="px-2 py-0.5 rounded-lg bg-neutral-800 text-[10px] font-bold text-neutral-300 hover:text-emerald-400 border border-neutral-700 transition-colors"
              title="Alternar velocidade (1x, 1.5x, 2x)"
            >
              {playbackSpeed}x
            </button>

            {/* Mute toggle button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title={isMuted ? 'Ativar som' : 'Mutar som'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Volume mini slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setIsMuted(v === 0);
              }}
              className="hidden sm:inline-block w-14 accent-emerald-500 cursor-pointer h-1 bg-neutral-800 rounded"
              title="Ajustar volume"
            />

            {/* Time display */}
            <span className="text-[11px] text-neutral-400 font-bold ml-1">
              <strong className="text-emerald-400">{formatSeconds(currentTime)}</strong> / {formatSeconds(totalDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Fullscreen button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-400 transition-colors"
              title={isFullscreen ? 'Reduzir tela' : 'Tela cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
