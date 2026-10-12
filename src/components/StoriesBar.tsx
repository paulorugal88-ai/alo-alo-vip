import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Clock, Sparkles } from 'lucide-react';
import { StoryViewerModal, StoryItem } from './StoryViewerModal';

interface StoryUser {
  id: string;
  name: string;
  avatar: string;
  timeRemaining: number; // in seconds
  roleBadge: string;
  imageUrl: string;
  caption: string;
}

export const StoriesBar: React.FC = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<StoryUser[]>([
    {
      id: '1',
      name: 'Usuário #1121',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
      caption: 'Movimentação no cruzamento da Av. Paulista com Consolação. Monitoramento de perímetro 100% ativo.',
      timeRemaining: 23 * 3600 + 15 * 60 + 22,
      roleBadge: 'IA Análise',
    },
    {
      id: '2',
      name: 'Alerta #0844',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&auto=format&fit=crop&q=80',
      caption: 'Fluxo canalizado sentido bairro. Equipes da CET no local orientando os motoristas.',
      timeRemaining: 22 * 3600 + 41 * 60 + 5,
      roleBadge: 'IA Análise',
    },
    {
      id: '3',
      name: 'Patrulha #2290',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
      caption: 'Ronda preventiva realizada na Rua Augusta e Jardins. Perímetro tranquilo.',
      timeRemaining: 19 * 3600 + 3 * 60 + 57,
      roleBadge: 'IA Análise',
    },
    {
      id: '4',
      name: 'Central #01',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      caption: 'Câmeras da central operacional calibradas. Detecção de placas e tráfego operando sem delay.',
      timeRemaining: 18 * 3600 + 45 * 60 + 10,
      roleBadge: 'IA Ativa',
    },
  ]);

  // Tick timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStories(prev =>
        prev.map(s => ({
          ...s,
          timeRemaining: Math.max(0, s.timeRemaining - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const storyItems: StoryItem[] = stories.map(s => ({
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    roleBadge: s.roleBadge,
    timeRemainingText: formatTime(s.timeRemaining),
    imageUrl: s.imageUrl,
    caption: s.caption,
  }));

  return (
    <div className="space-y-3">
      {/* 24h stories strip */}
      <div className="bg-neutral-900/60 rounded-2xl p-3 border border-neutral-800/80">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2.5 px-1">
          <span className="font-semibold text-neutral-300">Mensagens que desaparecem em 24h</span>
          <span className="text-emerald-400 font-medium">Stories 24h</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => setSelectedStoryIndex(idx)}
              className="flex-1 min-w-[100px] max-w-[130px] flex flex-col items-center p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/90 hover:border-emerald-500/50 transition-all cursor-pointer group active:scale-95"
              title="Clique para assistir ao story da central"
            >
              {/* Avatar with neon emerald ring */}
              <div className="relative mb-1.5">
                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-full h-full rounded-full object-cover border-2 border-neutral-950"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
              </div>

              <span className="text-[11px] font-bold text-neutral-200 truncate w-full text-center">
                {story.name}
              </span>

              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono mt-0.5">
                <Clock className="w-2.5 h-2.5 text-neutral-500" />
                <span>{formatTime(story.timeRemaining)}</span>
              </div>

              <div className="mt-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{story.roleBadge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={storyItems}
          initialIndex={selectedStoryIndex}
          isOpen={selectedStoryIndex !== null}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {/* AI Analysis alert bar */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 via-neutral-900/80 to-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <Activity className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <div className="font-bold text-neutral-100 flex items-center gap-1.5">
            <span>IA analisando 12 ocorrências ativas</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
            Detecções nas últimas 2h: movimento suspeito · tráfego atípico · áudio anômalo verificado na rede
          </p>
        </div>
      </div>
    </div>
  );
};

