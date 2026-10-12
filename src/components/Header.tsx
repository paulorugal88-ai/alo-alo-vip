import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Radio,
  BarChart3,
  Users,
  Sparkles,
  User,
  Bell,
  Sun,
  Moon,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../types';
import { AdminLoginModal } from './AdminLoginModal';

interface HeaderProps {
  currentTab: 'feed' | 'charts' | 'admin' | 'sofia' | 'profile';
  setCurrentTab: (tab: 'feed' | 'charts' | 'admin' | 'sofia' | 'profile') => void;
  isAdmMode: boolean;
  setIsAdmMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  currentUserRole: UserRole;
  realMembersCount: number;
  botMembersCount: number;
  totalCapacity: number;
  onlineCount: number;
  themeMode: 'escuro' | 'alto-contraste';
  onToggleTheme: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isAdmMode,
  setIsAdmMode,
  currentUserRole,
  realMembersCount,
  botMembersCount,
  totalCapacity,
  onlineCount,
  themeMode,
  onToggleTheme,
}) => {
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const handleAdminSuccess = () => {
    setIsAdmMode(true);
  };

  const handleAdminLogout = () => {
    setIsAdmMode(false);
    if (currentTab === 'charts' || currentTab === 'admin') {
      setCurrentTab('feed');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-emerald-950/60 px-3 sm:px-5 py-3 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
          
          {/* Top brand line & ADM access */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg tracking-wider">
                ALÔ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    ALÔ ALÔ <span className="text-emerald-400">VIP</span>
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      isAdmMode
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {isAdmMode ? 'ADM MASTER' : 'VIP 24H'}
                  </span>
                </div>
                
                {/* Member count display: 
                    - Normal view: 100% hidden bots, shows "10.000 membros VIP · 876 online"
                    - ADM view: Reveals "4 pessoas reais · 9.996 bots · 10.000 vagas"
                */}
                <div className="text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                  {isAdmMode ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <strong className="text-white">{realMembersCount} reais</strong> · {botMembersCount.toLocaleString('pt-BR')} bots · {totalCapacity.toLocaleString('pt-BR')} vagas
                    </span>
                  ) : (
                    <span className="text-neutral-300 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <strong className="text-emerald-400">{totalCapacity.toLocaleString('pt-BR')} membros VIP</strong>
                      <span className="text-neutral-500">·</span>
                      <span>{onlineCount} online agora</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* High Contrast / Outdoor Theme Button */}
              <button
                onClick={onToggleTheme}
                title={
                  themeMode === 'escuro'
                    ? 'Ativar Modo Alto Contraste (Ambientes Externos / Luz Solar / Noite)'
                    : 'Voltar para Modo Escuro (Central VIP 24h)'
                }
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  themeMode === 'alto-contraste'
                    ? 'bg-amber-400 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                {themeMode === 'alto-contraste' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-neutral-950" />
                    <span className="hidden sm:inline">Alto Contraste</span>
                    <span className="sm:hidden">Sol</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden sm:inline">Modo Escuro</span>
                    <span className="sm:hidden">Escuro</span>
                  </>
                )}
              </button>

              {/* Login ADM Button:
                  - If NOT ADM: Shows "Login ADM" button that opens authentication modal
                  - If IS ADM: Shows active ADM badge with quick toggle/logout option
              */}
              {isAdmMode ? (
                <button
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  title="Painel de Segurança do ADM (Clique para gerenciar ou sair)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20 hover:bg-emerald-900/60"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">ADM Ativo</span>
                  <span className="sm:hidden">ADM</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  title="Acesso exclusivo para o Administrador do Grupo"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-neutral-900 hover:bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Login ADM</span>
                </button>
              )}

              {/* Profile Shortcut */}
              <button
                onClick={() => setCurrentTab('profile')}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:border-emerald-500/40 transition-colors"
                title="Meu Perfil"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation:
              - Regular members only see: Central 24h, Sofia & Trânsito, VIP Perfil
              - Only the ADM sees: Gráficos & Logins, Painel ADM
          */}
          <nav className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar border-t border-neutral-900 pt-2">
            <button
              onClick={() => setCurrentTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                currentTab === 'feed'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Central 24h
            </button>

            {/* Gráficos & Logins - APENAS PARA O ADM */}
            {isAdmMode && (
              <button
                onClick={() => setCurrentTab('charts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentTab === 'charts'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gráficos & Logins</span>
                <span className="text-[9px] px-1 py-0.1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-bold">
                  ADM
                </span>
              </button>
            )}

            {/* Painel ADM - APENAS PARA O ADM */}
            {isAdmMode && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentTab === 'admin'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Painel ADM</span>
              </button>
            )}

            <button
              onClick={() => setCurrentTab('sofia')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                currentTab === 'sofia'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sofia & Trânsito
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                currentTab === 'profile'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              VIP Perfil
            </button>
          </nav>

        </div>
      </header>

      {/* Admin Login & Security Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccessLogin={handleAdminSuccess}
        isAlreadyAdm={isAdmMode}
        onLogoutAdm={handleAdminLogout}
      />
    </>
  );
};
