export type UserRole = 'member' | 'admin';

export type ReportCategory = 'alerta' | 'transito' | 'ocorrencia' | 'informacao' | 'audio';

export interface LoginLog {
  date: string; // YYYY-MM-DD
  count: number;
  timestamps: string[]; // e.g. "09:15", "14:22"
}

export interface MemberMonthlyStats {
  month: string; // "10/2026"
  totalLogins: number;
  totalMessages: number;
  loginsByDate: { date: string; day: number; count: number }[];
  messagesByDate: { date: string; day: number; count: number }[];
  categoryBreakdown: {
    category: ReportCategory;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  engagementRate: number; // e.g. 88%
  goalCompletionRate: number; // e.g. 92%
}

export interface Member {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar: string;
  isBot: boolean; // Flag known ONLY to ADM
  status: 'active' | 'trial' | 'expired' | 'blocked';
  trialDaysLeft?: number;
  paidUntil?: string;
  pixKey?: string;
  registeredAt: string;
  location?: string;
  isOnline: boolean;
  role: UserRole;
  stats: MemberMonthlyStats;
}

export interface IncidentLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface FeedMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isBot: boolean; // ONLY displayed if viewer is in ADM inspect mode
  timeAgo: string;
  timestamp: string;
  type: 'text' | 'audio' | 'video' | 'photo' | 'alerta' | 'ocorrencia' | 'chamada';
  category: ReportCategory;
  categoryLabel: string;
  content: string;
  location?: IncidentLocation;
  mediaUrl?: string;
  duration?: string; // For audio/video e.g. "00:47"
  isPinned?: boolean;
  isAdminReport?: boolean;
  expiresIn?: string;
  aiAnalyzed?: boolean;
  aiClassification?: string;
}

export interface BankConfig {
  titular: string;
  banco: string;
  agencia: string;
  conta: string;
  pixKey: string;
  valorMensal: number;
  diasLiberados: number;
  totalVagas: number;
}
