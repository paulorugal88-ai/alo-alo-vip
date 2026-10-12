import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, Play, Pause, Trash2, Volume2, RefreshCw } from 'lucide-react';
import { audioSynthesizer } from '../utils/audioSynthesizer';

interface AudioRecordBarProps {
  onCancel: () => void;
  onSendAudio: (durationFormatted: string, audioBlobUrl?: string) => void;
  onNotification?: (msg: string) => void;
}

export const AudioRecordBar: React.FC<AudioRecordBarProps> = ({
  onCancel,
  onSendAudio,
  onNotification,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize microphone recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startRecording = async () => {
      audioSynthesizer.playRadioBeep();

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/mp4' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
        }
      } catch {
        // Fallback: timer will continue and produce a simulated radio voice note
      }

      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    };

    startRecording();

    return () => {
      clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stop recording and preview
  const handleStopAndPreview = () => {
    setIsRecording(false);
    setHasRecorded(true);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Toggle preview play/pause
  const handleTogglePreviewPlay = () => {
    if (previewAudioRef.current) {
      if (isPlayingPreview) {
        previewAudioRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        previewAudioRef.current.play().then(() => {
          setIsPlayingPreview(true);
        }).catch(() => {
          setIsPlayingPreview(false);
        });
      }
    } else {
      // Synthetic fallback preview
      if (isPlayingPreview) {
        audioSynthesizer.stop();
        setIsPlayingPreview(false);
      } else {
        setIsPlayingPreview(true);
        audioSynthesizer.startVoiceNote(undefined, () => setIsPlayingPreview(false));
      }
    }
  };

  // Send finished audio
  const handleFinishAndSend = () => {
    audioSynthesizer.playRadioBeep();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    const formattedDur = formatSeconds(Math.max(1, seconds));
    onSendAudio(formattedDur, audioUrl || undefined);
    if (onNotification) onNotification('Áudio gravado com sucesso na Central!');
  };

  return (
    <div className="p-3 bg-neutral-900 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fade-in">
      {audioUrl && (
        <audio
          ref={previewAudioRef}
          src={audioUrl}
          onEnded={() => setIsPlayingPreview(false)}
        />
      )}

      {/* Live recording indicator */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isRecording ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          <Mic className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span>{isRecording ? 'Gravando áudio para a Central...' : 'Áudio gravado pronto para envio'}</span>
          </div>
          <span className="text-xs text-rose-400 font-mono font-bold">
            {formatSeconds(seconds)}
          </span>
        </div>
      </div>

      {/* Animated Frequency Equalizer */}
      <div className="flex items-center gap-1 h-6 px-2">
        {[20, 50, 80, 40, 90, 60, 30, 75, 45, 85, 30, 65, 40, 80, 50].map((h, i) => (
          <div
            key={i}
            style={{
              height: `${isRecording ? Math.max(15, (h + Math.sin(Date.now() / 100 + i) * 30)) : 30}%`,
            }}
            className={`w-1 rounded-full transition-all duration-100 ${
              isRecording ? 'bg-emerald-400' : 'bg-neutral-600'
            }`}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Discard button */}
        <button
          onClick={onCancel}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition-colors"
          title="Descartar gravação"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Stop to preview if still recording */}
        {isRecording && (
          <button
            onClick={handleStopAndPreview}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            title="Ouvir antes de enviar"
          >
            Ouvir prévia
          </button>
        )}

        {/* Listen preview button */}
        {!isRecording && (
          <button
            onClick={handleTogglePreviewPlay}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 transition-colors"
            title={isPlayingPreview ? 'Pausar áudio gravado' : 'Reproduzir áudio gravado'}
          >
            {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}

        {/* Send audio button */}
        <button
          onClick={handleFinishAndSend}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-emerald-500/30"
          title="Publicar áudio no feed"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar Áudio</span>
        </button>
      </div>
    </div>
  );
};
