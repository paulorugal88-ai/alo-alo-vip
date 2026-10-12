import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Shield,
  Radio,
  X,
  AlertTriangle,
  Clock,
  Mic,
  Volume2,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { IncidentLocation } from '../types';
import { PRESET_LOCATIONS } from '../mockData';

interface CallEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCallReport: (callData: {
    destination: string;
    number: string;
    notes: string;
    location: IncidentLocation;
    keepInFeed: boolean;
  }) => void;
}

export const CallEmergencyModal: React.FC<CallEmergencyModalProps> = ({
  isOpen,
  onClose,
  onPostCallReport,
}) => {
  const [activeCall, setActiveCall] = useState<{
    name: string;
    number: string;
    badge: string;
  } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('Chamada de emergência efetuada e comunicada à rede.');
  const [selectedLocation, setSelectedLocation] = useState<IncidentLocation>(PRESET_LOCATIONS[0]);
  const [keepInFeed, setKeepInFeed] = useState(true);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  if (!isOpen) return null;

  const emergencyContacts = [
    {
      name: 'Central Alô Alô VIP 24h',
      number: '0800-770-0190',
      badge: 'Despacho & Rádio',
      color: 'bg-emerald-600',
      desc: 'Linha direta com os operadores do grupo',
    },
    {
      name: 'Polícia Militar (PMESP)',
      number: '190',
      badge: 'Emergência Policial',
      color: 'bg-blue-600',
      desc: 'Ocorrências criminais e roubos',
    },
    {
      name: 'SAMU (Resgate Médico)',
      number: '192',
      badge: 'Resgate de Saúde',
      color: 'bg-red-600',
      desc: 'Acidentes de trânsito e socorro urgente',
    },
    {
      name: 'Corpo de Bombeiros',
      number: '193',
      badge: 'Incêndio & Salvamento',
      color: 'bg-amber-600',
      desc: 'Vítimas presas, fogo e desabamentos',
    },
    {
      name: 'CET Trânsito São Paulo',
      number: '156',
      badge: 'Operação Viária',
      color: 'bg-orange-600',
      desc: 'Bloqueios de vias e semáforos quebrados',
    },
  ];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = (contact: typeof emergencyContacts[0]) => {
    setActiveCall(contact);
    setCallNotes(`Chamada realizada para ${contact.name} (${contact.number}).`);
  };

  const handleHangupAndSave = () => {
    if (activeCall) {
      if (keepInFeed) {
        onPostCallReport({
          destination: activeCall.name,
          number: activeCall.number,
          notes: callNotes,
          location: selectedLocation,
          keepInFeed: true,
        });
      }
    }
    setActiveCall(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-neutral-900 border border-neutral-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Chamada de Emergência</h3>
              <p className="text-[11px] text-neutral-400">Comunicação e despacho rápido 24h</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE CALL SCREEN (WhatsApp Call Style) */}
        {activeCall ? (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/40 text-center space-y-3.5 animate-fadeIn">
            <div className="relative inline-block mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-pulse">
                <PhoneCall className="w-8 h-8" />
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-950"></span>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white">{activeCall.name}</h4>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{activeCall.number}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-emerald-950/60 text-emerald-400 text-[11px] font-mono border border-emerald-500/30">
                <Clock className="w-3 h-3" />
                <span>Em chamada: {formatSeconds(callDuration)}</span>
              </div>
            </div>

            {/* Simulated Audio Waves */}
            <div className="flex items-center justify-center gap-1 h-6">
              {[40, 75, 100, 60, 30, 85, 95, 50, 70, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(6, (h * (callDuration % 3 + 1)) / 3)}px`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            {/* Location */}
            <div className="text-left bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800 text-xs">
              <span className="text-[10px] text-neutral-400 font-bold block mb-1">Local da Chamada:</span>
              <span className="text-emerald-300 font-semibold">{selectedLocation.name}</span>
            </div>

            {/* Option to keep call record in feed */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-left cursor-pointer">
              <div>
                <span className="font-bold text-white block">Deixar Registro no Feed (24h)</span>
                <span className="text-[10px] text-neutral-400">Avisa os membros que a chamada foi efetuada</span>
              </div>
              <input
                type="checkbox"
                checked={keepInFeed}
                onChange={(e) => setKeepInFeed(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            {/* Hangup / Save */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href={`tel:${activeCall.number.replace(/\D/g, '')}`}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Discar no Celular</span>
              </a>

              <button
                type="button"
                onClick={handleHangupAndSave}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Finalizar & Salvar</span>
              </button>
            </div>
          </div>
        ) : (
          /* LIST OF CONTACTS */
          <div className="space-y-2">
            <p className="text-xs text-neutral-400">
              Selecione uma linha direta para ligar ou registrar acionamento imediato:
            </p>

            <div className="space-y-1.5">
              {emergencyContacts.map((contact, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/50 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${contact.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {contact.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 shrink-0">
                          {contact.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{contact.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartCall(contact)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                      title="Chamar na central"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Ligar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Location selector */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Local de referência da chamada:
              </label>
              <select
                value={selectedLocation.name}
                onChange={(e) => {
                  const found = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                  if (found) setSelectedLocation(found);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
