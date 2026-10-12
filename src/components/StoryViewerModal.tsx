import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Send, Clock, Sparkles } from 'lucide-react';

export interface StoryItem {
  id: string;
  name: string;
  avatar: string;
  roleBadge: string;
  timeRemainingText: string;
  imageUrl: string;
  caption: string;
}

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSendReply?: (storyName: string, reply: string) => void;
  onNotification?: (msg: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  onClose,
  onSendReply,
  onNotification,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  // Story progress timer (5 seconds per story)
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  if (!isOpen || !stories[currentIndex]) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(c => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
      setProgress(0);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onSendReply) {
      onSendReply(currentStory.name, replyText.trim());
    }
    const sentName = currentStory.name;
    setReplyText('');
    setFeedbackSent(true);
    if (onNotification) {
      onNotification(`Resposta enviada para ${sentName}!`);
    }
    setTimeout(() => {
      setFeedbackSent(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Container */}
      <div className="relative w-full max-w-sm h-[620px] bg-neutral-950 rounded-3xl overflow-hidden border border-emerald-950/80 shadow-2xl flex flex-col justify-between">
        
        {/* Story top progress bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${idx < currentIndex ? 100 : idx === currentIndex ? progress : 0}%`,
                }}
                className="h-full bg-emerald-400 transition-all duration-100"
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="relative z-30 pt-6 px-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <img
              src={currentStory.avatar}
              alt={currentStory.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">{currentStory.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {currentStory.roleBadge}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                <Clock className="w-2.5 h-2.5 text-neutral-400" />
                <span>{currentStory.timeRemainingText}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 rounded-full bg-black/50 text-white hover:text-emerald-400 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-black/50 text-white hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Media Center */}
        <div
          className="relative flex-1 my-2 mx-1 rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => setIsPaused(!isPaused)}
        >
          <img
            src={currentStory.imageUrl}
            alt={currentStory.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Navigation tap areas */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Caption */}
          <div className="absolute bottom-3 left-3 right-3 text-xs text-white leading-relaxed bg-black/60 backdrop-blur-sm p-2.5 rounded-xl border border-neutral-800">
            <p className="font-medium">{currentStory.caption}</p>
          </div>
        </div>

        {/* Story Reply Input */}
        <form onSubmit={handleSend} className="relative z-30 p-3 pt-1 flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Responder ao story..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center disabled:opacity-40 transition-colors font-bold"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
