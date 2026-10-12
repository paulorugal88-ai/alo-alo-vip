import { BankConfig, FeedMessage, Member, MemberMonthlyStats } from './types';

// Helper to generate realistic October 2026 login and message stats
export function generateMonthStats(
  baseLogins: number,
  baseMessages: number,
  categoryWeights: { alerta: number; transito: number; ocorrencia: number; informacao: number; audio: number }
): MemberMonthlyStats {
  const daysInMonth = 11; // Current date is Oct 11, 2026
  const loginsByDate: { date: string; day: number; count: number }[] = [];
  const messagesByDate: { date: string; day: number; count: number }[] = [];

  let accumulatedLogins = 0;
  let accumulatedMessages = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${formattedDay}/10`;
    
    // Day variations
    const dayFactor = ((day * 7 + baseLogins) % 5) + 1;
    const lCount = Math.max(1, Math.round((baseLogins / daysInMonth) * 0.7 + dayFactor));
    const mCount = Math.max(0, Math.round((baseMessages / daysInMonth) * 0.8 + (dayFactor % 3)));

    loginsByDate.push({ date: dateStr, day, count: lCount });
    messagesByDate.push({ date: dateStr, day, count: mCount });

    accumulatedLogins += lCount;
    accumulatedMessages += mCount;
  }

  const totalCatWeight = categoryWeights.alerta + categoryWeights.transito + categoryWeights.ocorrencia + categoryWeights.informacao + categoryWeights.audio;
  const cTransito = Math.round((categoryWeights.transito / totalCatWeight) * accumulatedMessages);
  const cAlerta = Math.round((categoryWeights.alerta / totalCatWeight) * accumulatedMessages);
  const cOcorrencia = Math.round((categoryWeights.ocorrencia / totalCatWeight) * accumulatedMessages);
  const cInformacao = Math.round((categoryWeights.informacao / totalCatWeight) * accumulatedMessages);
  const cAudio = Math.max(0, accumulatedMessages - (cTransito + cAlerta + cOcorrencia + cInformacao));

  const total = Math.max(1, accumulatedMessages);
  const categoryBreakdown = [
    {
      category: 'transito' as const,
      label: 'Trânsito & Rotas',
      count: cTransito,
      percentage: Math.round((cTransito / total) * 100),
      color: '#10b981', // emerald
    },
    {
      category: 'alerta' as const,
      label: 'Alertas & Radares',
      count: cAlerta,
      percentage: Math.round((cAlerta / total) * 100),
      color: '#ef4444', // red
    },
    {
      category: 'ocorrencia' as const,
      label: 'Ocorrências Locais',
      count: cOcorrencia,
      percentage: Math.round((cOcorrencia / total) * 100),
      color: '#f59e0b', // amber
    },
    {
      category: 'audio' as const,
      label: 'Áudios & Voz',
      count: cAudio,
      percentage: Math.round((cAudio / total) * 100),
      color: '#06b6d4', // cyan
    },
    {
      category: 'informacao' as const,
      label: 'Informações Gerais',
      count: cInformacao,
      percentage: Math.round((cInformacao / total) * 100),
      color: '#8b5cf6', // purple
    },
  ];

  return {
    month: '10/2026',
    totalLogins: accumulatedLogins,
    totalMessages: accumulatedMessages,
    loginsByDate,
    messagesByDate,
    categoryBreakdown,
    engagementRate: Math.min(100, Math.round((accumulatedLogins / (daysInMonth * 3)) * 100)),
    goalCompletionRate: Math.min(100, Math.round((accumulatedMessages / 30) * 100)),
  };
}

export const INITIAL_BANK_CONFIG: BankConfig = {
  titular: 'PAULO ROBERTO',
  banco: '077 - Inter',
  agencia: '0001',
  conta: '24822466-2',
  pixKey: '21991235823',
  valorMensal: 10,
  diasLiberados: 30,
  totalVagas: 10000,
};

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'user-admin',
    name: 'Você (Paulo ADM)',
    email: 'admin@demo.local',
    whatsapp: '+55 21 99123-5823',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    status: 'active',
    paidUntil: '31/12/2026',
    pixKey: '21991235823',
    registeredAt: '09/10/2026',
    location: 'São Paulo, SP · Brasil',
    isOnline: true,
    role: 'admin',
    stats: generateMonthStats(38, 45, { transito: 18, alerta: 12, ocorrencia: 8, informacao: 5, audio: 2 }),
  },
  {
    id: 'user-maria',
    name: 'Maria (exemplo)',
    email: 'maria@exemplo.com',
    whatsapp: '+55 11 98765-4321',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    status: 'trial',
    trialDaysLeft: 6,
    pixKey: 'maria@exemplo.com',
    registeredAt: '10/10/2026',
    location: 'Pinheiros, SP',
    isOnline: true,
    role: 'member',
    stats: generateMonthStats(19, 14, { transito: 6, alerta: 3, ocorrencia: 2, informacao: 2, audio: 1 }),
  },
  {
    id: 'user-joao',
    name: 'João (exemplo)',
    email: 'joao@exemplo.com',
    whatsapp: '+55 11 97654-3210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    status: 'expired',
    registeredAt: '02/10/2026',
    location: 'Zona Sul, SP',
    isOnline: false,
    role: 'member',
    stats: generateMonthStats(24, 21, { transito: 10, alerta: 5, ocorrencia: 3, informacao: 2, audio: 1 }),
  },
  {
    id: 'user-ana',
    name: 'Ana (exemplo)',
    email: 'ana@exemplo.com',
    whatsapp: '+55 11 99876-5432',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    status: 'active',
    paidUntil: '31/10/2026',
    pixKey: '123.456.789-00',
    registeredAt: '29/09/2026',
    location: 'Moema, SP',
    isOnline: true,
    role: 'member',
    stats: generateMonthStats(32, 28, { transito: 12, alerta: 8, ocorrencia: 4, informacao: 3, audio: 1 }),
  },
  // Simulated members (stealth bots - only ADM knows isBot: true)
  {
    id: 'bot-silva',
    name: 'Agente Silva',
    email: 'agente.silva@rede.local',
    whatsapp: '+55 11 98112-9988',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    status: 'active',
    registeredAt: '15/09/2026',
    location: 'Setor Jardins, SP',
    isOnline: true,
    role: 'member',
    stats: generateMonthStats(44, 39, { transito: 15, alerta: 14, ocorrencia: 7, informacao: 2, audio: 1 }),
  },
  {
    id: 'bot-central-norte',
    name: 'Central Norte',
    email: 'norte.apoio@rede.local',
    whatsapp: '+55 11 97223-1122',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    status: 'active',
    registeredAt: '10/09/2026',
    location: 'Zona Norte, SP',
    isOnline: true,
    role: 'member',
    stats: generateMonthStats(52, 48, { transito: 20, alerta: 15, ocorrencia: 8, informacao: 3, audio: 2 }),
  },
  {
    id: 'bot-monitor-07',
    name: 'Monitor #07',
    email: 'monitor07@rede.local',
    whatsapp: '+55 11 98834-5544',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    status: 'active',
    registeredAt: '01/09/2026',
    location: 'Setor B, SP',
    isOnline: true,
    role: 'member',
    stats: generateMonthStats(39, 31, { transito: 14, alerta: 8, ocorrencia: 5, informacao: 3, audio: 1 }),
  },
  {
    id: 'bot-patrulha-2290',
    name: 'Patrulha #2290',
    email: 'patrulha2290@rede.local',
    whatsapp: '+55 11 99192-3344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    status: 'active',
    registeredAt: '05/09/2026',
    location: 'Av. Rebouças, SP',
    isOnline: true,
    role: 'member',
    stats: generateMonthStats(41, 35, { transito: 16, alerta: 11, ocorrencia: 6, informacao: 1, audio: 1 }),
  },
];

export const PRESET_LOCATIONS = [
  { name: 'Av. Paulista, 1578 (MASP)', lat: -23.5614, lng: -46.6559 },
  { name: 'Rua Augusta x Alameda Santos', lat: -23.5587, lng: -46.6589 },
  { name: 'Av. Brigadeiro Luís Antônio, 2200', lat: -23.5654, lng: -46.6519 },
  { name: 'Av. Rebouças, 1200', lat: -23.5714, lng: -46.6853 },
  { name: 'Av. Faria Lima, 3477 (Itaim)', lat: -23.5872, lng: -46.6822 },
  { name: 'Marginal Pinheiros (Ponte Estaiada)', lat: -23.6128, lng: -46.6989 },
  { name: 'Santana (Zona Norte)', lat: -23.5015, lng: -46.6288 },
];

export const INITIAL_MESSAGES: FeedMessage[] = [
  {
    id: 'msg-0',
    authorId: 'user-admin',
    authorName: 'PAULO ROBERTO (ADM)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    isAdminReport: true,
    expiresIn: 'Válido por 24h · 23h 52min restantes',
    timeAgo: 'há 8min',
    timestamp: '14:24',
    type: 'photo',
    category: 'transito',
    categoryLabel: 'Foto com GPS · Trânsito',
    content: 'Aviso Oficial do ADM: Ponto de monitoramento ativo na Av. Paulista com fluxo moderado e semáforos sincronizados.',
    location: { lat: -23.5614, lng: -46.6559, name: 'Av. Paulista, 1578 (MASP)' },
    mediaUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    aiAnalyzed: true,
    aiClassification: 'Comunicado Oficial ADM',
  },
  {
    id: 'msg-1',
    authorId: 'bot-silva',
    authorName: 'Agente Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    isAdminReport: false,
    expiresIn: 'Válido por 24h · 23h 48min restantes',
    timeAgo: 'há 12min',
    timestamp: '14:20',
    type: 'video',
    category: 'ocorrencia',
    categoryLabel: 'Vídeo · 00:24',
    content: 'Movimentação detectada na Rua Alameda. Acesso monitorado às 14:20. IA classificou risco médio.',
    location: { lat: -23.5587, lng: -46.6589, name: 'Rua Augusta x Alameda Santos' },
    duration: '00:24',
    aiAnalyzed: true,
    aiClassification: 'Risco Médio · Verificado',
  },
  {
    id: 'msg-2',
    authorId: 'bot-central-norte',
    authorName: 'Central Norte',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    isAdminReport: false,
    expiresIn: 'Válido por 24h · 23h 25min restantes',
    timeAgo: 'há 35min',
    timestamp: '13:57',
    type: 'audio',
    category: 'audio',
    categoryLabel: 'Áudio · 00:47',
    content: 'Registro de áudio ambiente: movimentação atípica próxima ao portão leste. Transcrição gerada por IA.',
    location: { lat: -23.5015, lng: -46.6288, name: 'Santana (Zona Norte)' },
    duration: '00:47',
    aiAnalyzed: true,
    aiClassification: 'Áudio Limpo · 98% Precisão',
  },
  {
    id: 'msg-3',
    authorId: 'bot-monitor-07',
    authorName: 'Monitor #07',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    timeAgo: 'há 1h',
    timestamp: '13:30',
    type: 'text',
    category: 'informacao',
    categoryLabel: 'Ronda Periódica',
    content: 'Nenhuma anomalia detectada no setor B nos últimos ciclos. Patrulha programada para 15:30.',
    location: { lat: -23.5872, lng: -46.6822, name: 'Av. Faria Lima, 3477' },
    aiAnalyzed: true,
    aiClassification: 'Perímetro Normal',
  },
  {
    id: 'msg-4',
    authorId: 'user-maria',
    authorName: 'Maria (exemplo)',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    timeAgo: 'há 1h 15min',
    timestamp: '13:15',
    type: 'alerta',
    category: 'transito',
    categoryLabel: 'Alerta de Trânsito',
    content: 'Trânsito parado na descida da Brigadeiro Luís Antônio sentido Paulista devido a caminhão quebrado na faixa central.',
    location: { lat: -23.5654, lng: -46.6519, name: 'Av. Brigadeiro Luís Antônio x Paulista' },
    aiAnalyzed: true,
    aiClassification: 'Tráfego Intenso',
  },
  {
    id: 'msg-5',
    authorId: 'bot-patrulha-2290',
    authorName: 'Patrulha #2290',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isBot: true,
    timeAgo: 'há 1h 40min',
    timestamp: '12:50',
    type: 'alerta',
    category: 'ocorrencia',
    categoryLabel: 'Patrulha Ativa',
    content: 'Operação preventiva e blitz educativa na altura do Parque Ibirapuera / Rebouças. Fluxo canalizado em 2 faixas.',
    location: { lat: -23.5714, lng: -46.6853, name: 'Av. Rebouças, 1200' },
    aiAnalyzed: true,
    aiClassification: 'Operação Policial',
  },
  {
    id: 'msg-6',
    authorId: 'user-ana',
    authorName: 'Ana (exemplo)',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    isBot: false,
    timeAgo: 'há 2h',
    timestamp: '12:30',
    type: 'alerta',
    category: 'transito',
    categoryLabel: 'Alerta de Radar',
    content: 'Radar móvel novo instalado próximo à alça da Ponte Estaiada na Marginal Pinheiros sentido Interlagos.',
    location: { lat: -23.6128, lng: -46.6989, name: 'Marginal Pinheiros (Ponte Estaiada)' },
    aiAnalyzed: true,
    aiClassification: 'Radar Verificado',
  },
];

export const BOT_SIMULATED_REPLIES = [
  'Atenção pessoal: radar móvel posicionado na saída do túnel 9 de Julho.',
  'Patrulha passou aqui pela Faria Lima há 5 minutos, tudo tranquilo no trecho.',
  'Evitem a Marginal Pinheiros sentido Castello, lentidão acima de 40 minutos.',
  'Ocorrência encerrada pelos agentes no cruzamento com a Rebouças. Tráfego liberado.',
  'Chuva forte iniciando na região central, pista escorregadia no viaduto do Chá.',
  'Confirmo o reporte do colega! Faixa da direita desobstruída agora.',
  'Equipe de apoio já em deslocamento para verificação preventiva.',
  'Câmera do semáforo da Rua Augusta operando normalmente.',
];
