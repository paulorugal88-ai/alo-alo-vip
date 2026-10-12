import React, { useState } from 'react';
import {
  Users,
  Bot,
  Settings,
  Zap,
  CheckCircle2,
  Lock,
  Unlock,
  BarChart3,
  CreditCard,
  ShieldAlert,
  Flame,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { BankConfig, Member } from '../types';

interface AdminPanelProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  bankConfig: BankConfig;
  setBankConfig: React.Dispatch<React.SetStateAction<BankConfig>>;
  botAutoPosting: boolean;
  setBotAutoPosting: (val: boolean | ((prev: boolean) => boolean)) => void;
  themeMode?: 'escuro' | 'alto-contraste';
  onToggleTheme?: (newMode: 'escuro' | 'alto-contraste') => void;
  onTriggerBotMessage: () => void;
  onInspectMemberCharts: (memberId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  members,
  setMembers,
  bankConfig,
  setBankConfig,
  botAutoPosting,
  setBotAutoPosting,
  themeMode = 'escuro',
  onToggleTheme,
  onTriggerBotMessage,
  onInspectMemberCharts,
}) => {
  const [adminTab, setAdminTab] = useState<'membros' | 'bots' | 'config' | 'turbo'>('membros');

  // Local form state for Config
  const [formData, setFormData] = useState<BankConfig>({ ...bankConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [turboActive, setTurboActive] = useState(false);

  // Filter real members vs simulated
  const realMembers = members.filter(m => !m.isBot);
  const realMembersCount = realMembers.length;
  const botMembersCount = bankConfig.totalVagas - realMembersCount;

  // Actions
  const handleLiberar30Dias = (memberId: string) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            status: 'active',
            paidUntil: '11/11/2026',
            trialDaysLeft: undefined,
          };
        }
        return m;
      })
    );
  };

  const handleToggleBlock = (memberId: string) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === memberId) {
          const nextStatus = m.status === 'blocked' ? 'active' : 'blocked';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setBankConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleActivateTurbo = () => {
    setTurboActive(true);
    onTriggerBotMessage();
    setTimeout(() => setTurboActive(false), 4000);
  };

  return (
    <div className="space-y-4">
      {/* ADM Banner Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-emerald-950/50 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Painel do ADM</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-neutral-950">
                Acesso Total
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {realMembersCount} membros reais · 1 aguardando confirmação · {botMembersCount.toLocaleString('pt-BR')} bots camuflados
            </p>
          </div>

          <div className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Vagas: 10.000 (Rede Completa)</span>
          </div>
        </div>

        {/* Tab selection matching mockup #15 & #16 */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAdminTab('membros')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              adminTab === 'membros'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Membros Reais ({realMembersCount})
          </button>

          <button
            onClick={() => setAdminTab('bots')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              adminTab === 'bots'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Motor Secreto de Bots
          </button>

          <button
            onClick={() => setAdminTab('config')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              adminTab === 'config'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Config & Pix Inter
          </button>

          <button
            onClick={() => setAdminTab('turbo')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              adminTab === 'turbo'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Turbo 10x
          </button>
        </div>
      </div>

      {/* ABA 1: Membros Reais (Matching screenshot #16) */}
      {adminTab === 'membros' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Gestão de Assinaturas e Acessos</span>
            <span className="text-emerald-400 font-semibold">{realMembersCount} membros humanos</span>
          </div>

          <div className="space-y-2.5">
            {realMembers.map(member => (
              <div
                key={member.id}
                className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        {member.role === 'admin' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ADM
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400">{member.email}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        Pix Inter: {member.pixKey || '—'} · Cadastro: {member.registeredAt}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {member.status === 'trial' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-500/30">
                        Teste: {member.trialDaysLeft || 6} dia(s)
                      </span>
                    )}
                    {member.status === 'active' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        Pago até {member.paidUntil || '31/10/2026'}
                      </span>
                    )}
                    {member.status === 'expired' && (
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/30 inline-block">
                          Vencido
                        </span>
                        <div className="text-[10px] text-amber-300 font-semibold mt-1">
                          💰 Avisou que pagou
                        </div>
                      </div>
                    )}
                    {member.status === 'blocked' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/30">
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions row: Liberar +30 dias, Bloquear, Ver Gráficos */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/70">
                  <button
                    onClick={() => handleLiberar30Dias(member.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Liberar +30 dias
                  </button>

                  <button
                    onClick={() => handleToggleBlock(member.id)}
                    className="py-1.5 px-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    {member.status === 'blocked' ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        Desbloquear
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-neutral-400" />
                        Bloquear
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onInspectMemberCharts(member.id)}
                    className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    title="Ver gráfico de logins e reportes deste membro"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Gráficos
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-400 text-center">
            Bots ocupando vagas: <strong className="text-white">{botMembersCount.toLocaleString('pt-BR')}</strong> (diminuem sozinhos a cada pessoa real que se cadastra).
          </div>
        </div>
      )}

      {/* ABA 2: Motor Secreto de Bots (Camuflagem Total) */}
      {adminTab === 'bots' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Camuflagem Stealth de 9.996 Bots</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Garantia: Membros comuns enxergam apenas usuários reais da comunidade
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Automação:</span>
                <button
                  onClick={() => setBotAutoPosting(prev => !prev)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    botAutoPosting
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {botAutoPosting ? 'ATIVA' : 'PAUSADA'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Total de Bots Ativos</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {botMembersCount.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">Preenchem até 10.000</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Visibilidade para Membros</div>
                <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                  <span>100% Oculto</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">Zero indicação de robô</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="text-xs text-neutral-400">Visibilidade para ADM</div>
                <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Visão Total</span>
                </div>
                <div className="text-[10px] text-amber-400 mt-1">Identificados com tag [Simulado]</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={onTriggerBotMessage}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Disparar Alerta Stealth Imediato (Teste)
              </button>
              <span className="text-[11px] text-neutral-400 text-center sm:text-left">
                Insere uma mensagem de trânsito ou ronda com nome e foto humana comum
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: Configuração & Pagamento PIX Banco Inter (Matching screenshot #15) */}
      {adminTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-5">
          {/* Nova Seção: Modo de Exibição / Alto Contraste para Uso Externo */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Modo de Exibição do Administrador (Uso Externo)</span>
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Alterne para Alto Contraste para operar o painel sob sol forte em viaturas ou na rua sem reflexos.
                </p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                themeMode === 'alto-contraste'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-300'
              }`}>
                {themeMode === 'alto-contraste' ? 'Sol / Ativo' : 'Escuro / Padrão'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Option 1: Modo Escuro */}
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('escuro')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  themeMode === 'escuro'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-500/10'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  themeMode === 'escuro' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Modo Escuro (Padrão)</span>
                    {themeMode === 'escuro' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                    Design escuro stealth para sala de monitoramento e operações à noite.
                  </div>
                </div>
              </button>

              {/* Option 2: Alto Contraste */}
              <button
                type="button"
                onClick={() => onToggleTheme && onToggleTheme('alto-contraste')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  themeMode === 'alto-contraste'
                    ? 'border-amber-400 bg-amber-500/10 text-white shadow-md shadow-amber-500/10'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  themeMode === 'alto-contraste' ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Modo Alto Contraste</span>
                    {themeMode === 'alto-contraste' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                    Fundo claro antirreflexo com texto em preto nítido para luz solar direta.
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pagamento e Vagas (Banco Inter)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configurações que aparecem aos membros na hora do pagamento Pix
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Chave Pix do Banco Inter (que os membros vão pagar)
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="sua-chave-pix@bancointer"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Nome do titular (aparece na tela de pagamento)
              </label>
              <input
                type="text"
                value={formData.titular}
                onChange={e => setFormData({ ...formData, titular: e.target.value })}
                placeholder="Seu Nome Completo"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Banco & Código
                </label>
                <input
                  type="text"
                  value={formData.banco}
                  onChange={e => setFormData({ ...formData, banco: e.target.value })}
                  placeholder="077 - Inter"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Agência e Conta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.agencia}
                    onChange={e => setFormData({ ...formData, agencia: e.target.value })}
                    placeholder="Agência"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={formData.conta}
                    onChange={e => setFormData({ ...formData, conta: e.target.value })}
                    placeholder="Conta"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  value={formData.valorMensal}
                  onChange={e => setFormData({ ...formData, valorMensal: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Dias liberados por pagamento
                </label>
                <input
                  type="number"
                  value={formData.diasLiberados}
                  onChange={e => setFormData({ ...formData, diasLiberados: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Total de vagas (pessoas + bots)
                </label>
                <input
                  type="number"
                  value={formData.totalVagas}
                  onChange={e => setFormData({ ...formData, totalVagas: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar configurações</span>
            </button>
            {saveSuccess && (
              <p className="text-center text-xs text-emerald-400 font-bold mt-2">
                Configurações salvas e aplicadas com sucesso!
              </p>
            )}
          </div>
        </form>
      )}

      {/* ABA 4: Turbinar Postagens Turbo 10x (Matching screenshot #8) */}
      {adminTab === 'turbo' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Flame className="w-4 h-4" />
              <span>Turbinar Postagens Turbo 10x</span>
            </div>
            <div className="text-xs text-neutral-300 flex items-center gap-2 flex-wrap font-mono">
              <span className="text-emerald-400 font-bold">Engajamento +1.050%</span>
              <span>·</span>
              <span>Alcance: 24.3k → 258k</span>
            </div>
            <p className="text-xs text-neutral-400 pt-1 leading-relaxed">
              Ativa o algoritmo de simulação acelerada: gera alertas imediatos nos canais locais como se 258 mil pessoas estivessem visualizando e validando em tempo real.
            </p>

            <div className="pt-2">
              <button
                onClick={handleActivateTurbo}
                disabled={turboActive}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{turboActive ? 'TURBO 10X ATIVADO!' : 'ATIVAR TURBO 10X AGORA'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-400">Usuários</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">1.248</div>
              <div className="text-[10px] text-emerald-500">+32 hoje</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-400">Premium</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">342</div>
              <div className="text-[10px] text-neutral-400">27.4%</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-400">Ativos</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">876</div>
              <div className="text-[10px] text-emerald-500">134 agora</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
