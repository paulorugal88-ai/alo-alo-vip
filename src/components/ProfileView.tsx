import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  Sun,
  Moon,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Edit2,
  Camera,
  Upload,
  Check,
  Save,
  ShieldCheck
} from 'lucide-react';
import { BankConfig, Member } from '../types';

interface ProfileViewProps {
  currentUser: Member;
  bankConfig: BankConfig;
  themeMode?: 'escuro' | 'alto-contraste';
  onToggleTheme?: (val: 'escuro' | 'alto-contraste') => void;
  onUpdateProfile: (updated: Partial<Member>) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  bankConfig,
  themeMode = 'escuro',
  onToggleTheme,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [brightness, setBrightness] = useState(70);
  const [selectedColor, setSelectedColor] = useState('Verde Neon');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const colors = [
    { name: 'Cinza Grafite', hex: '#262626' },
    { name: 'Azul Noturno', hex: '#1e3a8a' },
    { name: 'Roxo VIP', hex: '#6b21a8' },
    { name: 'Laranja Alerta', hex: '#ea580c' },
    { name: 'Verde Neon', hex: '#10b981' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      whatsapp,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="text-center py-2">
        <h2 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
          ALÔ ALÔ <span className="text-emerald-400">VIP Premium</span>
        </h2>
        <p className="text-xs text-neutral-400">Personalização completa do membro</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Photo Box with Working Upload & Preset Selector */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Clique para trocar sua foto de perfil"
          >
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <img
                src={avatar}
                alt={name}
                className="w-full h-full rounded-full object-cover border-4 border-neutral-950"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center border-2 border-neutral-950 shadow-md group-hover:bg-emerald-400 transition-colors">
              <Camera className="w-4 h-4" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-emerald-400 font-semibold mt-2 cursor-pointer hover:underline flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            <span>trocar foto</span>
          </button>

          {/* Quick Avatar Presets */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-neutral-500">Ou escolha:</span>
            {AVATAR_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatar(p)}
                className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                  avatar === p ? 'border-emerald-400 ring-2 ring-emerald-500' : 'border-neutral-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome</label>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent text-sm text-white focus:outline-none"
              />
              <Edit2 className="w-4 h-4 text-neutral-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Número WhatsApp</label>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+55 (11) 98765-4321"
                className="w-full bg-transparent text-sm text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Color palette selector (mockup #4) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Cor da Tela</label>
            <div className="flex items-center gap-2.5">
              {colors.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
                    selectedColor === c.name
                      ? 'ring-2 ring-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                >
                  {selectedColor === c.name && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              {selectedColor} · Selecionado
            </p>
          </div>

          {/* Brightness Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-neutral-400" />
                Brilho da Tela
              </span>
              <span className="text-emerald-400 font-mono">{brightness}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Design da Tela (Escuro vs Alto Contraste para Uso Externo) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">Design da Tela & Contraste</label>
              <span className="text-[10px] text-emerald-400 font-mono">
                {themeMode === 'alto-contraste' ? 'Modo Externo Ativo' : 'Modo Escuro Ativo'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('escuro')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  themeMode === 'escuro'
                    ? 'bg-neutral-800 text-white border-emerald-500 shadow-sm'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-emerald-400" />
                <span>Modo Escuro (Padrão)</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('alto-contraste')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  themeMode === 'alto-contraste'
                    ? 'bg-amber-400 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Alto Contraste (Externo)</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-tight">
              O modo de alto contraste reforça fontes e bordas para uso fácil em campo sob sol direto.
            </p>
          </div>
        </div>

        {/* Cartão Banco Inter Vinculado */}
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              BANCO INTER VINCULADO
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Ativo
            </span>
          </div>

          <div className="text-xs space-y-1 pt-1 font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Titular</span>
              <strong className="text-white">{bankConfig.titular}</strong>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Banco</span>
              <strong className="text-white">{bankConfig.banco}</strong>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Agência</span>
              <strong className="text-white">{bankConfig.agencia}</strong>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Conta</span>
              <strong className="text-white">{bankConfig.conta}</strong>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Chave Pix</span>
              <strong className="text-amber-400 font-bold">{bankConfig.pixKey}</strong>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-emerald-400/90 flex items-center gap-1.5 border-t border-neutral-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seu banco já está vinculado. Não vai pedir mais toda vez.</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Salvar Personalização Completa</span>
        </button>

        {savedSuccess && (
          <p className="text-center text-xs text-emerald-400 font-bold animate-pulse">
            Perfil e foto atualizados com sucesso na Central!
          </p>
        )}
      </form>
    </div>
  );
};
