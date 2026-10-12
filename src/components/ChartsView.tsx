import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  MessageSquare,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  UserCheck,
  Shield,
  ArrowUpRight,
  LogIn,
  PieChart as PieIcon
} from 'lucide-react';
import { Member, MemberMonthlyStats, ReportCategory } from '../types';

interface ChartsViewProps {
  members: Member[];
  currentUserId: string;
  isAdmMode: boolean;
  onSimulateLogin: (memberId: string) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  members,
  currentUserId,
  isAdmMode,
  onSimulateLogin,
}) => {
  // If ADM, can switch between inspecting any member
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentUserId);
  const [selectedMonth, setSelectedMonth] = useState<string>('10/2026');

  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];
  const stats = activeMember.stats;

  // Max calculations for chart scaling
  const maxLogins = Math.max(...stats.loginsByDate.map(d => d.count), 5);
  const maxMessages = Math.max(...stats.messagesByDate.map(d => d.count), 5);

  return (
    <div className="space-y-5">
      {/* Header & Member Switcher */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Desempenho & Gráficos do Membro
              </h2>
              <p className="text-xs text-neutral-400">
                Acompanhamento mensal de acessos, frequência de logins e volume de reportes
              </p>
            </div>
          </div>
        </div>

        {/* Member dropdown (If ADM, allows inspecting any member. If member, shows their own profile) */}
        <div className="flex items-center gap-2">
          {isAdmMode ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 whitespace-nowrap">Inspecionar membro:</span>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="bg-neutral-900 text-xs font-semibold text-emerald-300 border border-emerald-500/40 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-400"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
                    {m.name} {m.isBot ? '(Simulado)' : '(Real)'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <img
                src={activeMember.avatar}
                alt={activeMember.name}
                className="w-5 h-5 rounded-full object-cover border border-emerald-500"
              />
              <span className="text-xs font-bold text-neutral-200">{activeMember.name}</span>
            </div>
          )}

          <button
            onClick={() => onSimulateLogin(activeMember.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
            title="Registrar novo acesso hoje e atualizar gráfico em tempo real"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>+1 Login Hoje</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total de Logins</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {stats.totalLogins}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Outubro 2026</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Reportes Enviados</span>
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {stats.totalMessages}
          </div>
          <div className="text-[10px] text-cyan-400 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Mensagens no mês</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Taxa de Presença</span>
            <Percent className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {stats.engagementRate}%
          </div>
          <div className="text-[10px] text-amber-400 font-medium mt-1">
            Frequência ativa
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Meta de Reportes</span>
            <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {stats.goalCompletionRate}%
          </div>
          <div className="text-[10px] text-purple-400 font-medium mt-1">
            {stats.totalMessages} de 30 esperados
          </div>
        </div>
      </div>

      {/* GRÁFICO 1: Quantas vezes logaram e a data */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Gráfico de Logins por Data (Outubro 2026)</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Quantas vezes o membro acessou a central em cada data do mês
            </p>
          </div>
          <div className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Média: {(stats.totalLogins / stats.loginsByDate.length).toFixed(1)} logins/dia
          </div>
        </div>

        {/* Visual Bar Chart for Logins */}
        <div className="pt-4 pb-2">
          <div className="flex items-end gap-1.5 sm:gap-2 h-44 w-full border-b border-neutral-800 px-1 pb-1">
            {stats.loginsByDate.map(item => {
              const heightPercent = Math.max(12, (item.count / maxLogins) * 100);
              const isToday = item.day === 11;
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Hover count pill */}
                  <span className="text-[10px] font-mono font-bold text-neutral-400 group-hover:text-emerald-300 transition-colors mb-1">
                    {item.count}
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[28px] relative rounded-t-lg overflow-hidden transition-all duration-300" style={{ height: `${heightPercent}%` }}>
                    <div
                      className={`w-full h-full transition-colors ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/40'
                          : 'bg-gradient-to-t from-emerald-950 via-emerald-800/80 to-emerald-600/70 group-hover:from-emerald-700 group-hover:to-emerald-400'
                      }`}
                    />
                  </div>

                  {/* Date label */}
                  <span className={`text-[10px] font-mono mt-2 transition-colors ${isToday ? 'text-emerald-400 font-bold' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 px-1">
            <span>Início do mês (01/10)</span>
            <span className="text-emerald-400 font-medium">Data atual: 11/10/2026 (Hoje)</span>
          </div>
        </div>
      </div>

      {/* GRÁFICO 2 & 3: Mensagens reportadas e Gráfico de Porcentagem (%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* GRÁFICO 2: Volume de mensagens reportadas por data */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Mensagens e Reportes por Data</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Volume diário de ocorrências e mensagens emitidas
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
              {stats.totalMessages} reportes
            </span>
          </div>

          <div className="pt-3 pb-1">
            <div className="flex items-end gap-1.5 sm:gap-2 h-36 w-full border-b border-neutral-800 px-1 pb-1">
              {stats.messagesByDate.map(item => {
                const heightPercent = Math.max(10, (item.count / maxMessages) * 100);
                const isToday = item.day === 11;
                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-cyan-300 transition-colors mb-1">
                      {item.count}
                    </span>
                    <div className="w-full max-w-[26px] relative rounded-t-lg overflow-hidden transition-all duration-300" style={{ height: `${heightPercent}%` }}>
                      <div
                        className={`w-full h-full ${
                          isToday
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/40'
                            : 'bg-gradient-to-t from-cyan-950 via-cyan-800/80 to-cyan-600/70 group-hover:from-cyan-700 group-hover:to-cyan-400'
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] font-mono mt-2 ${isToday ? 'text-cyan-400 font-bold' : 'text-neutral-500'}`}>
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GRÁFICO 3: Gráfico de Porcentagem (%) durante o mês */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                <span>Gráfico de Porcentagem (%) de Reportes</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Distribuição percentual por categoria no mês de Outubro
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-lg">
              100% Total
            </span>
          </div>

          {/* Progress stack & category bars */}
          <div className="space-y-3 pt-1">
            {/* Horizontal compound bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-neutral-800 p-0.5">
              {stats.categoryBreakdown.map(cat => (
                <div
                  key={cat.category}
                  style={{ width: `${Math.max(4, cat.percentage)}%`, backgroundColor: cat.color }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:opacity-80 cursor-pointer"
                  title={`${cat.label}: ${cat.percentage}% (${cat.count} mensagens)`}
                />
              ))}
            </div>

            {/* Category breakdown detail rows */}
            <div className="space-y-2 pt-1">
              {stats.categoryBreakdown.map(cat => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-neutral-300 font-medium">{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-neutral-400 text-[11px]">{cat.count} reportes</span>
                    <span className="text-white font-bold w-10 text-right">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Histórico diário em tabela para inspeção detalhada */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Tabela Analítica Diária · {activeMember.name}</span>
          </h3>
          <span className="text-xs text-neutral-400">Total de 11 dias monitorados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Qtd. Logins</th>
                <th className="py-2.5 px-3">Qtd. Reportes</th>
                <th className="py-2.5 px-3">% Participação</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {stats.loginsByDate.map((item, idx) => {
                const msgItem = stats.messagesByDate[idx];
                const dayPercent = Math.round((msgItem.count / Math.max(1, stats.totalMessages)) * 100);
                return (
                  <tr key={item.date} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-neutral-300 font-semibold">{item.date}/2026</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {item.count} logins
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400">
                      {msgItem.count} mensagens
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400">
                      {dayPercent}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                        Ativo
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
