/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Header } from './components/Header';
import { StoriesBar } from './components/StoriesBar';
import { FeedView } from './components/FeedView';
import { ChartsView } from './components/ChartsView';
import { AdminPanel } from './components/AdminPanel';
import { ProfileView } from './components/ProfileView';
import { AiSofiaView } from './components/AiSofiaView';
import {
  INITIAL_BANK_CONFIG,
  INITIAL_MEMBERS,
  INITIAL_MESSAGES,
  BOT_SIMULATED_REPLIES,
  PRESET_LOCATIONS,
} from './mockData';
import { BankConfig, FeedMessage, Member, ReportCategory } from './types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDQSPAAH8h-_AUMKOMBXBz-1A4MA9uLmtg';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'feed' | 'charts' | 'admin' | 'sofia' | 'profile'>('feed');
  const [isAdmMode, setIsAdmMode] = useState<boolean>(true); // Admin preview enabled initially so user can test both views immediately
  const [themeMode, setThemeMode] = useState<'escuro' | 'alto-contraste'>(() => {
    try {
      const saved = localStorage.getItem('alo_vip_theme');
      if (saved === 'alto-contraste' || saved === 'escuro') return saved;
    } catch {
      // fallback
    }
    return 'escuro';
  });
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [messages, setMessages] = useState<FeedMessage[]>(() => {
    try {
      const saved = localStorage.getItem('alo_vip_messages_feed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_MESSAGES;
  });
  const [bankConfig, setBankConfig] = useState<BankConfig>(INITIAL_BANK_CONFIG);
  const [botAutoPosting, setBotAutoPosting] = useState<boolean>(true);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Persist messages across reloads so photos/videos are kept in the feed
  useEffect(() => {
    try {
      localStorage.setItem('alo_vip_messages_feed', JSON.stringify(messages));
    } catch (e) {
      try {
        // Fallback: If quota exceeded due to heavy images/videos, store compact representations
        const compact = messages.slice(0, 35).map((m) => ({
          ...m,
          mediaUrl: m.mediaUrl && m.mediaUrl.length > 300000 ? undefined : m.mediaUrl,
        }));
        localStorage.setItem('alo_vip_messages_feed', JSON.stringify(compact));
      } catch (err2) {
        console.warn('LocalStorage quota limit reached, maintaining in React state', err2);
      }
    }
  }, [messages]);

  // If user exits ADM mode and is on charts or admin tab, redirect to feed
  useEffect(() => {
    if (!isAdmMode && (currentTab === 'charts' || currentTab === 'admin')) {
      setCurrentTab('feed');
    }
  }, [isAdmMode, currentTab]);

  // Toggle theme between dark mode and high-contrast outdoor mode
  const handleToggleTheme = (newMode?: 'escuro' | 'alto-contraste') => {
    setThemeMode(prev => {
      const next = newMode !== undefined ? newMode : (prev === 'escuro' ? 'alto-contraste' : 'escuro');
      try {
        localStorage.setItem('alo_vip_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Listen for GMP demo key quota exceeded event
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Current logged in user is the admin / demo user
  const currentUserId = 'user-admin';
  const currentUser = members.find(m => m.id === currentUserId) || members[0];

  const realMembersCount = members.filter(m => !m.isBot).length;
  const botMembersCount = bankConfig.totalVagas - realMembersCount;

  // Handle simulating a new login for a member (today: 11/10)
  const handleSimulateLogin = (memberId: string) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === memberId) {
          const stats = { ...member.stats };
          const todayItem = stats.loginsByDate.find(d => d.day === 11);
          if (todayItem) {
            todayItem.count += 1;
          }
          stats.totalLogins += 1;
          stats.engagementRate = Math.min(100, Math.round((stats.totalLogins / (11 * 3)) * 100));
          return { ...member, stats };
        }
        return member;
      })
    );
  };

  // Handle new message / report sent by current user
  const handleNewMessageSent = (category: ReportCategory) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === currentUserId) {
          const stats = { ...member.stats };
          const todayItem = stats.messagesByDate.find(d => d.day === 11);
          if (todayItem) {
            todayItem.count += 1;
          }
          stats.totalMessages += 1;

          // Update category breakdown
          const catItem = stats.categoryBreakdown.find(c => c.category === category);
          if (catItem) {
            catItem.count += 1;
          }
          // Recalculate percentages
          const total = Math.max(1, stats.totalMessages);
          stats.categoryBreakdown = stats.categoryBreakdown.map(c => ({
            ...c,
            percentage: Math.round((c.count / total) * 100),
          }));
          stats.goalCompletionRate = Math.min(100, Math.round((stats.totalMessages / 30) * 100));

          return { ...member, stats };
        }
        return member;
      })
    );
  };

  // Function for admin to trigger an instant stealth bot message
  const handleTriggerBotMessage = () => {
    const randomReply = BOT_SIMULATED_REPLIES[Math.floor(Math.random() * BOT_SIMULATED_REPLIES.length)];
    const stealthBots = [
      { name: 'Patrulha #2290', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', cat: 'transito' as const, label: 'Trânsito em Tempo Real' },
      { name: 'Monitor #07', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', cat: 'informacao' as const, label: 'Ronda Setorial' },
      { name: 'Agente Silva', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', cat: 'ocorrencia' as const, label: 'Ocorrência Verificada' },
    ];
    const picked = stealthBots[Math.floor(Math.random() * stealthBots.length)];
    const randomLoc = PRESET_LOCATIONS[Math.floor(Math.random() * PRESET_LOCATIONS.length)];

    const botMsg: FeedMessage = {
      id: `bot-msg-${Date.now()}`,
      authorId: `bot-stealth-${Date.now()}`,
      authorName: picked.name,
      authorAvatar: picked.avatar,
      isBot: true, // Only visible to ADM if in ADM view
      timeAgo: 'agora mesmo',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      category: picked.cat,
      categoryLabel: picked.label,
      content: randomReply,
      location: randomLoc,
      aiAnalyzed: true,
      aiClassification: 'Verificado por IA',
    };

    setMessages(prev => [botMsg, ...prev]);
  };

  // Update profile
  const handleUpdateProfile = (updated: Partial<Member>) => {
    setMembers(prev =>
      prev.map(m => (m.id === currentUserId ? { ...m, ...updated } : m))
    );
  };

  // When clicking "Gráficos" in admin member list, navigate directly to charts view
  const handleInspectMemberCharts = (memberId: string) => {
    setCurrentTab('charts');
  };

  return (
    <APIProvider apiKey={API_KEY} libraries={['visualization']}>
      <div
        className={`min-h-screen ${
          themeMode === 'alto-contraste'
            ? 'high-contrast theme-root bg-slate-100 text-slate-950'
            : 'bg-neutral-950 text-neutral-100'
        } flex flex-col items-center transition-colors duration-200 w-full max-w-full overflow-x-hidden`}
        style={{ overscrollBehaviorX: 'none' }}
      >
        {/* GMP Quota Defense Banner */}
        {quotaExceeded && (
          <div className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs text-center sticky top-0 z-50 backdrop-blur">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-400 hover:text-amber-300"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top Banner Notice: ONLY visible to ADM */}
        {isAdmMode && (
          <div
            className={`w-full ${
              themeMode === 'alto-contraste'
                ? 'bg-emerald-100 border-b-2 border-emerald-800 text-emerald-950 font-semibold'
                : 'bg-emerald-950/40 border-b border-emerald-900/40 text-emerald-300'
            } py-1.5 px-3 text-center text-[11px] transition-colors`}
          >
            <span className="font-bold">Privacidade VIP (ADM Ativo):</span> Membros reais nunca sabem que existem bots. Apenas você com a chave ADM visualiza os dados reais e gráficos.
          </div>
        )}

      {/* Main Container: Fixed centered, no horizontal movement */}
      <div
        className={`w-full max-w-lg sm:max-w-xl md:max-w-2xl min-h-screen ${
          themeMode === 'alto-contraste'
            ? 'theme-container bg-white border-x-2 border-slate-900'
            : 'bg-neutral-950 border-x border-neutral-900/80'
        } flex flex-col shadow-2xl relative transition-colors duration-200 mx-auto overflow-x-hidden`}
      >
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isAdmMode={isAdmMode}
          setIsAdmMode={setIsAdmMode}
          currentUserRole={currentUser.role}
          realMembersCount={realMembersCount}
          botMembersCount={botMembersCount}
          totalCapacity={bankConfig.totalVagas}
          onlineCount={876}
          themeMode={themeMode}
          onToggleTheme={() => handleToggleTheme()}
        />

        <main className="flex-1 p-3 sm:p-4 space-y-4 pb-20">
          {currentTab === 'feed' && (
            <>
              <StoriesBar />
              <FeedView
                messages={messages}
                setMessages={setMessages}
                currentUser={currentUser}
                isAdmMode={isAdmMode}
                onNewMessageSent={handleNewMessageSent}
              />
            </>
          )}

          {currentTab === 'charts' && (
            <ChartsView
              members={members}
              currentUserId={currentUserId}
              isAdmMode={isAdmMode}
              onSimulateLogin={handleSimulateLogin}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanel
              members={members}
              setMembers={setMembers}
              bankConfig={bankConfig}
              setBankConfig={setBankConfig}
              botAutoPosting={botAutoPosting}
              setBotAutoPosting={setBotAutoPosting}
              themeMode={themeMode}
              onToggleTheme={(m) => handleToggleTheme(m)}
              onTriggerBotMessage={handleTriggerBotMessage}
              onInspectMemberCharts={handleInspectMemberCharts}
            />
          )}

          {currentTab === 'sofia' && <AiSofiaView />}

          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              bankConfig={bankConfig}
              themeMode={themeMode}
              onToggleTheme={(m) => handleToggleTheme(m)}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>
    </div>
  </APIProvider>
);
}
