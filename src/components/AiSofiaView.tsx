import React, { useState } from 'react';
import {
  Sparkles,
  Navigation,
  MapPin,
  Car,
  Brain,
  Send,
  Mic,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { audioSynthesizer } from '../utils/audioSynthesizer';

export const AiSofiaView: React.FC = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'sofia'; text: string; time: string }[]>([
    {
      sender: 'sofia',
      text: 'Olá! Sou a Sofia, assistente da Central ALÔ ALÔ VIP. Estou monitorando o trânsito da cidade e os 10.000 pontos de reporte em tempo real. Como posso te orientar agora?',
      time: '14:30',
    },
    {
      sender: 'user',
      text: 'Qual a melhor rota da Rua Augusta para a Av. Paulista agora?',
      time: '14:31',
    },
    {
      sender: 'sofia',
      text: 'Recomendo subir pela Alameda Santos para evitar o semáforo travado da Consolação. Tempo estimado: 18 minutos (7.2 km). Rota sem radares móveis ativos no momento.',
      time: '14:31',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userText, time: now }]);
    setInputVal('');

    setTimeout(() => {
      let reply = 'Recebido! Consultei os reportes mais recentes da Central 24h. O trecho informado está seguro e com fluxo moderado.';
      if (userText.toLowerCase().includes('radar') || userText.toLowerCase().includes('blitz')) {
        reply = 'Atenção: último reporte de radar móvel registrado no km 18 há 15 minutos. Mantenha velocidade de segurança.';
      } else if (userText.toLowerCase().includes('paulista') || userText.toLowerCase().includes('trânsito') || userText.toLowerCase().includes('transito')) {
        reply = 'Fluxo lento na aproximação da Av. Paulista sentido Paraíso. Desvio recomendado via Alameda Jaú economiza 12 minutos.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'sofia',
          text: reply,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              ALÔ ALÔ VIP · Assistente Inteligente
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              Sofia Central de Monitoramento
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            IA Ativa 24h
          </span>
        </div>
      </div>

      {/* Navigation Map card (Mockup #5) */}
      <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/90 space-y-3 p-3">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-neutral-200 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-400" />
            Navegação Inteligente
          </span>
          <span className="text-neutral-400 font-mono">Waze / GPS Integrado</span>
        </div>

        {/* Simulated Neon Cyberpunk GPS route */}
        <div className="relative h-44 rounded-xl overflow-hidden bg-neutral-950 border border-emerald-950 flex flex-col justify-between p-3">
          {/* Map grid lines background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Simulated neon path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 40 120 Q 90 40 180 60 T 320 80"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="6 3"
              className="drop-shadow-[0_0_8px_#10b981]"
            />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-neutral-900/90 border border-neutral-700 px-2.5 py-1 rounded-lg text-[11px] text-neutral-300 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Rua Augusta</span>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-700 px-2.5 py-1 rounded-lg text-[11px] text-neutral-300 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Av. Paulista</span>
            </div>
          </div>

          <div className="relative z-10 bg-neutral-950/95 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Rua Augusta → Av. Paulista</div>
                <div className="text-[11px] text-neutral-400 font-mono">18min · 7.2km · Chegada 09:59</div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsNavigating(!isNavigating);
                audioSynthesizer.playRadioBeep();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                isNavigating
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/25'
              }`}
            >
              {isNavigating ? 'Encerrar' : 'Iniciar'}
            </button>
          </div>
        </div>

        {/* Active GPS Turn-by-Turn HUD when navigation is running */}
        {isNavigating && (
          <div className="p-3 bg-neutral-950 border border-emerald-500/40 rounded-xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                NAVEGAÇÃO GPS EM TEMPO REAL
              </span>
              <span className="font-mono text-neutral-400">42 km/h · 8 Satélites</span>
            </div>

            <div className="flex items-center gap-3 p-2 bg-neutral-900 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-black text-lg">
                ↱
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Em 250m, vire à direita na Alameda Santos</div>
                <div className="text-[11px] text-neutral-400">Evita semáforo lento da Consolação (-12 min)</div>
              </div>
            </div>

            <div className="text-[10px] text-emerald-400/90 flex items-center justify-between font-mono pt-1">
              <span>● Radar fixo a 600m (60 km/h)</span>
              <span>Chegada estimada: 09:59</span>
            </div>
          </div>
        )}
      </div>

      {/* Sofia Data Stats (Mockup #5: 12.847 mensagens analisadas) */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-neutral-800 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <Brain className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
            12.847
          </div>
          <div className="text-xs text-neutral-300 font-semibold">
            mensagens analisadas pela rede
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1 flex-wrap font-mono">
            <span className="text-emerald-400">● Treinamento ativo</span>
            <span>·</span>
            <span>Comunicação 98.4%</span>
            <span>·</span>
            <span>Resposta natural</span>
          </div>
        </div>
      </div>

      {/* Sofia Interactive Chat */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fale com a Sofia sobre o trânsito e alertas</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                m.sender === 'user'
                  ? 'ml-auto bg-emerald-500 text-neutral-950 font-medium'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
              }`}
            >
              <p>{m.text}</p>
              <div
                className={`text-[9px] mt-1 font-mono text-right ${
                  m.sender === 'user' ? 'text-neutral-900/70' : 'text-neutral-500'
                }`}
              >
                {m.time}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1 border-t border-neutral-800">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Pergunte à Sofia sobre radares, rotas ou blitz..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center shrink-0 font-bold transition-transform active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
