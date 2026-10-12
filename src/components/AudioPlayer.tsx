import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw } from 'lucide-react';
import { audioSynthesizer } from '../utils/audioSynthesizer';

interface AudioPlayerProps {
  audioUrl?: string;
  duration?: string;
  label?: string;
  onNotification?: (msg: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration = '00:47',
  label = 'Nota de voz gravada',
  onNotification,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(47);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRealAudio = Boolean(audioUrl);

  // Parse duration if given as "MM:SS"
  useEffect(() => {
    if (duration) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        const parsed = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          setDurationSec(parsed);
        }
      }
    }
  }, [duration]);

  // Handle HTML5 audio events if real audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCurrentTimeSec(Math.floor(audio.currentTime));
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDurationSec(Math.round(audio.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTimeSec(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRealAudio]);

  // Adjust playback speed & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.muted = isMuted;
    }
  }, [speed, isMuted]);

  // Play / Pause handling
  const handleTogglePlay = () => {
    if (isRealAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      // Synthetic sound playback
      if (isPlaying) {
        audioSynthesizer.stop();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        if (!isMuted) {
          audioSynthesizer.startVoiceNote(
            (p) => {
              setProgress(p);
              setCurrentTimeSec(Math.floor((p / 100) * durationSec));
            },
            () => {
              setIsPlaying(false);
              setProgress(0);
              setCurrentTimeSec(0);
            }
          );
        } else {
          // Muted timer fallback
          let p = progress;
          const interval = setInterval(() => {
            p += (4 * speed);
            if (p >= 100) {
              clearInterval(interval);
              setIsPlaying(false);
              setProgress(0);
              setCurrentTimeSec(0);
            } else {
              setProgress(p);
              setCurrentTimeSec(Math.floor((p / 100) * durationSec));
            }
          }, 200);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      audioSynthesizer.stop();
    };
  }, []);

  // Handle clicking on waveform to seek
  const handleSeek = (idx: number, total: number) => {
    const targetPercent = (idx / total) * 100;
    setProgress(targetPercent);
    const targetSec = (targetPercent / 100) * durationSec;
    setCurrentTimeSec(Math.floor(targetSec));

    if (isRealAudio && audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (targetPercent / 100) * audioRef.current.duration;
    }
  };

  // Toggle speed 1x -> 1.5x -> 2x
  const handleToggleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (onNotification) onNotification(`Velocidade de áudio: ${nextSpeed}x`);
  };

  // Reset audio to start
  const handleReset = () => {
    setProgress(0);
    setCurrentTimeSec(0);
    if (isRealAudio && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  // Download voice note
  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `audio-reporte-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (onNotification) onNotification('Áudio baixado com sucesso.');
    } else {
      if (onNotification) onNotification('Áudio simulado do sistema de rádio.');
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Waveform bars simulation
  const waveformHeights = [
    25, 40, 60, 30, 80, 95, 65, 45, 85, 100, 70, 50, 90, 75, 40, 60, 80, 55, 30, 70, 85, 60, 40, 20
  ];

  return (
    <div className="p-3 rounded-2xl bg-neutral-950/90 border border-neutral-800/90 my-2 flex flex-col gap-2 shadow-md">
      {isRealAudio && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md shadow-emerald-500/30"
          title={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Waveform track */}
          <div
            className="flex items-center gap-1 h-7 cursor-pointer"
            title="Clique em qualquer barra para avançar ou retroceder"
          >
            {waveformHeights.map((h, idx) => {
              const barProgress = (idx / waveformHeights.length) * 100;
              const isFilled = barProgress <= progress;
              return (
                <div
                  key={idx}
                  onClick={() => handleSeek(idx, waveformHeights.length)}
                  style={{
                    height: `${isPlaying ? Math.max(20, (h + Math.sin(Date.now() / 150 + idx) * 35)) : h}%`,
                  }}
                  className={`flex-1 rounded-full transition-all duration-150 hover:bg-emerald-300 ${
                    isFilled ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30' : 'bg-neutral-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Subtitle & details */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 font-mono">
            <span className="flex items-center gap-1.5 text-neutral-300 truncate">
              <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-sans font-medium truncate">{label}</span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-bold">
                {isPlaying ? formatSec(currentTimeSec) : duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary functional controls row */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-900 text-xs">
        <div className="flex items-center gap-1.5">
          {/* Speed Button (1x / 1.5x / 2x) */}
          <button
            onClick={handleToggleSpeed}
            className="px-2 py-0.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[10px] font-bold text-neutral-300 hover:text-emerald-400 border border-neutral-800 transition-colors"
            title="Velocidade de reprodução"
          >
            {speed}x
          </button>

          {/* Reset / Replay Button */}
          <button
            onClick={handleReset}
            className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            title="Voltar ao início do áudio"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            title={isMuted ? 'Desmutar' : 'Mutar áudio'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 p-1 rounded-lg transition-colors"
          title="Baixar arquivo de áudio"
        >
          <Download className="w-3 h-3" />
          <span>Baixar</span>
        </button>
      </div>
    </div>
  );
};
