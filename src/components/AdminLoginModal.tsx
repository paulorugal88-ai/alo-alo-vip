import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
  isAlreadyAdm: boolean;
  onLogoutAdm: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  isAlreadyAdm,
  onLogoutAdm,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Accepted passwords for the group admin: 'admin', 'vip', 'aloalo', '123456'
    const trimmed = password.trim().toLowerCase();
    if (trimmed === 'admin' || trimmed === 'vip' || trimmed === 'aloalo' || trimmed === '123456' || trimmed === 'admin123') {
      setErrorMessage('');
      setSuccessAnimation(true);
      setTimeout(() => {
        onSuccessLogin();
        setSuccessAnimation(false);
        setPassword('');
        onClose();
      }, 700);
    } else {
      setErrorMessage('Senha incorreta. Use a senha mestra do ADM (ex: "admin").');
    }
  };

  const handleDirectAccess = () => {
    setSuccessAnimation(true);
    setTimeout(() => {
      onSuccessLogin();
      setSuccessAnimation(false);
      setPassword('');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 relative text-neutral-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>Acesso Restrito ADM</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                VIP
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {isAlreadyAdm
                ? 'Você já está autenticado como Administrador Master'
                : 'Liberação exclusiva de Gráficos, Logins e Painel de Controle'}
            </p>
          </div>
        </div>

        {isAlreadyAdm ? (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block font-bold">Modo ADM Ativado</strong>
                <span>Você tem acesso total aos Gráficos, Logins e Bots ocultos.</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onLogoutAdm();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Bloquear / Sair do Modo ADM (Visão Membro)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Continuar no Painel ADM
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Senha do Administrador:</span>
                <span className="text-[10px] text-emerald-400">Dica: admin</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Digite a senha mestra..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successAnimation && (
              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">Acesso autorizado! Carregando opções...</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 font-black text-xs transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar com Senha</span>
            </button>

            {/* Quick 1-Click Access for Group Master */}
            <div className="pt-2 border-t border-neutral-800 text-center">
              <button
                type="button"
                onClick={handleDirectAccess}
                className="text-xs text-neutral-400 hover:text-emerald-400 underline transition-colors"
              >
                ⚡ Entrar direto como Criador / ADM do Grupo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
