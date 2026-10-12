import React, { useState, useRef } from 'react';
import {
  Send,
  Mic,
  Camera,
  Video,
  AlertTriangle,
  Info,
  MapPin,
  MoreVertical,
  Trash2,
  Pin,
  CheckCircle2,
  Sparkles,
  Bot,
  User,
  ListFilter,
  Map as MapIcon,
  Edit3,
  Maximize2,
  ThumbsUp,
  Share2,
  Plus,
  Compass,
  Flame,
  Clock,
  Shield,
  ShieldCheck,
  Check,
  ChevronDown,
  Paperclip,
  Phone,
  PhoneCall,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { FeedMessage, Member, ReportCategory, IncidentLocation } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { VideoPlayer } from './VideoPlayer';
import { PhotoUploadModal } from './PhotoUploadModal';
import { PhotoViewerModal } from './PhotoViewerModal';
import { AudioRecordBar } from './AudioRecordBar';
import { VideoRecordModal } from './VideoRecordModal';
import { QuickReportModal } from './QuickReportModal';
import { CallEmergencyModal } from './CallEmergencyModal';
import { EditMessageModal } from './EditMessageModal';
import { IncidentsMapView } from './IncidentsMapView';
import { FeedHeatmapOverlay } from './FeedHeatmapOverlay';
import { Toast, ToastMessage } from './Toast';
import { BOT_SIMULATED_REPLIES, PRESET_LOCATIONS } from '../mockData';

interface FeedViewProps {
  messages: FeedMessage[];
  setMessages: React.Dispatch<React.SetStateAction<FeedMessage[]>>;
  currentUser: Member;
  isAdmMode: boolean;
  onNewMessageSent: (category: ReportCategory) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  messages,
  setMessages,
  currentUser,
  isAdmMode,
  onNewMessageSent,
}) => {
  const [feedDisplayMode, setFeedDisplayMode] = useState<'feed' | 'map'>('feed');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'photo' | 'audio' | 'text'>('all');
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('transito');
  const [selectedLocation, setSelectedLocation] = useState<IncidentLocation>(PRESET_LOCATIONS[0]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [selectedIncidentForMap, setSelectedIncidentForMap] = useState<string | null>(null);
  const [showHeatmapInFeed, setShowHeatmapInFeed] = useState<boolean>(true);
  const [keepInFeed, setKeepInFeed] = useState<boolean>(true);

  // Hidden file inputs for direct native smartphone actions
  const directCameraInputRef = useRef<HTMLInputElement | null>(null);
  const directGalleryInputRef = useRef<HTMLInputElement | null>(null);

  // Reactions count map: { [msgId]: number }
  const [reactions, setReactions] = useState<{ [msgId: string]: number }>({});

  // Modals state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [viewingPhotoMessage, setViewingPhotoMessage] = useState<FeedMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<FeedMessage | null>(null);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (filterType === 'all') return true;
    if (filterType === 'video') return msg.type === 'video';
    if (filterType === 'photo') return msg.type === 'photo' || Boolean(msg.mediaUrl && msg.type !== 'video' && msg.type !== 'audio');
    if (filterType === 'audio') return msg.type === 'audio';
    if (filterType === 'text') return msg.type === 'text' || msg.type === 'alerta' || msg.type === 'ocorrencia' || msg.type === 'chamada';
    return true;
  });

  // Post message handler: ensures video, photos, audios all land directly on the 24h Feed
  const handleSendMessage = (
    e?: React.FormEvent,
    customType?: 'text' | 'audio' | 'video' | 'photo' | 'chamada',
    customContent?: string,
    customMediaUrl?: string,
    customDuration?: string,
    customLocation?: IncidentLocation,
    customCategory?: ReportCategory
  ) => {
    if (e) e.preventDefault();
    const textToSend = customContent || inputText.trim();
    if (!textToSend && !customType) return;

    const cat = customCategory || selectedCategory;
    const loc = customLocation || selectedLocation || undefined;

    const newMsg: FeedMessage = {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      isBot: false,
      isAdminReport: isAdmMode,
      expiresIn: 'Válido por 24h',
      timeAgo: 'agora mesmo',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: customType || 'text',
      category: cat,
      categoryLabel:
        customType === 'chamada'
          ? 'Chamada de Emergência'
          : cat === 'alerta'
          ? 'Alerta Prioritário'
          : cat === 'ocorrencia'
          ? 'Ocorrência Local'
          : cat === 'transito'
          ? 'Trânsito em Tempo Real'
          : cat === 'audio'
          ? 'Nota de Áudio'
          : 'Informação Geral',
      content:
        textToSend ||
        (customType === 'audio'
          ? 'Nota de áudio gravada pelo microfone na central 24h.'
          : customType === 'video'
          ? 'Vídeo registrado no local e transmitido ao feed.'
          : customType === 'photo'
          ? 'Registro fotográfico capturado com coordenadas de GPS.'
          : customType === 'chamada'
          ? 'Chamada de emergência efetuada na central de monitoramento.'
          : 'Reporte registrado na central.'),
      location: loc,
      mediaUrl: customMediaUrl,
      duration:
        customDuration ||
        (customType === 'audio' ? '00:15' : customType === 'video' ? '00:24' : undefined),
      aiAnalyzed: true,
      aiClassification: isAdmMode ? 'Comunicado Oficial ADM' : 'Verificado pela Central 24h',
    };

    setMessages((prev) => [newMsg, ...prev]);
    onNewMessageSent(cat);
    setInputText('');
    setShowAttachmentMenu(false);

    // Trigger stealth realistic community response after 2.4s
    setTimeout(() => {
      const randomReply =
        BOT_SIMULATED_REPLIES[Math.floor(Math.random() * BOT_SIMULATED_REPLIES.length)];
      const botPersonas = [
        {
          name: 'Carlos Trânsito',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          cat: 'transito' as const,
        },
        {
          name: 'Camila Santos',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          cat: 'informacao' as const,
        },
        {
          name: 'Patrulha Sul 04',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          cat: 'ocorrencia' as const,
        },
      ];
      const randomPersona = botPersonas[Math.floor(Math.random() * botPersonas.length)];
      const randomLoc = PRESET_LOCATIONS[Math.floor(Math.random() * PRESET_LOCATIONS.length)];

      const stealthReply: FeedMessage = {
        id: `msg-${Date.now() + 1}`,
        authorId: `bot-auto-${Date.now()}`,
        authorName: randomPersona.name,
        authorAvatar: randomPersona.avatar,
        isBot: true, // Only ADM sees [SIMULADO] tag
        isAdminReport: false,
        expiresIn: 'Válido por 24h',
        timeAgo: 'agora',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        category: randomPersona.cat,
        categoryLabel: 'Comentário da Comunidade',
        content: randomReply,
        location: randomLoc,
        aiAnalyzed: true,
        aiClassification: 'Analisado por IA',
      };

      setMessages((current) => [stealthReply, ...current]);
    }, 2400);
  };

  // Direct Smartphone Camera Capture
  const handleDirectCameraFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        let dataUrl = ev.target?.result as string;
        if (dataUrl) {
          try {
            const { optimizeImageDataUrl } = await import('../utils/imageOptimizer');
            dataUrl = await optimizeImageDataUrl(dataUrl, 900, 900, 0.75);
          } catch {
            // keep raw dataUrl
          }
          handleSendMessage(
            undefined,
            'photo',
            'Foto tirada no local com o celular.',
            dataUrl,
            undefined,
            selectedLocation,
            selectedCategory
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('📷 Foto capturada e deixada no Feed 24h com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct Smartphone Gallery Capture
  const handleDirectGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        let dataUrl = ev.target?.result as string;
        if (dataUrl) {
          try {
            const { optimizeImageDataUrl } = await import('../utils/imageOptimizer');
            dataUrl = await optimizeImageDataUrl(dataUrl, 900, 900, 0.75);
          } catch {
            // keep raw dataUrl
          }
          handleSendMessage(
            undefined,
            'photo',
            'Foto enviada da galeria para o monitoramento.',
            dataUrl,
            undefined,
            selectedLocation,
            selectedCategory
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('🖼️ Foto da galeria deixada no Feed 24h!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Moderation actions
  const handleDeleteForEveryone = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setActiveMenuMsgId(null);
    showToast('Reporte excluído da central.', 'info');
  };

  const handleTogglePin = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isPinned: !m.isPinned } : m))
    );
    setActiveMenuMsgId(null);
    showToast('Status de fixação atualizado.', 'info');
  };

  const handleSaveEditedContent = (msgId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content: newContent } : m))
    );
    showToast('Reporte atualizado com sucesso!');
  };

  // Like / Confirm incident counter
  const handleToggleConfirmReaction = (msgId: string) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: (prev[msgId] || 0) + 1,
    }));
    showToast('Você confirmou este reporte!', 'success');
  };

  // Navigate to map centered on message
  const handleNavigateToMap = (msg: FeedMessage) => {
    setSelectedIncidentForMap(msg.id);
    setFeedDisplayMode('map');
  };

  return (
    <div className="space-y-3.5 relative">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Hidden Native Camera & Gallery Inputs for 1-touch execution */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleDirectCameraFile}
        className="hidden"
      />
      <input
        ref={directGalleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectGalleryFile}
        className="hidden"
      />

      {/* Top Switcher: Feed 24h vs Mapa GPS */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFeedDisplayMode('feed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              feedDisplayMode === 'feed'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Feed 24h</span>
          </button>

          <button
            onClick={() => {
              setSelectedIncidentForMap(null);
              setFeedDisplayMode('map');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              feedDisplayMode === 'map'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Mapa GPS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Toggle Heatmap Overlay directly on Feed */}
          <button
            onClick={() => {
              const next = !showHeatmapInFeed;
              setShowHeatmapInFeed(next);
              showToast(
                next
                  ? 'Mapa de calor sobreposto aberto! Arraste com o dedo para navegar.'
                  : 'Mapa de calor do feed recolhido.',
                'info'
              );
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border active:scale-95 ${
              showHeatmapInFeed
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-amber-500/40'
            }`}
            title="Exibir mapa de calor sobreposto no feed em tempo real"
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmapInFeed ? 'fill-neutral-950 text-neutral-950' : 'text-amber-400'}`} />
            <span>Calor: {showHeatmapInFeed ? 'ABERTO' : 'FECHADO'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${showHeatmapInFeed ? 'bg-red-600 animate-ping' : 'bg-amber-400'}`}></span>
          </button>
        </div>

        {/* Quick Modal Trigger */}
        <button
          onClick={() => setIsQuickReportOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          title="Criar novo reporte detalhado"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Novo Reporte</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* RENDER MAP VIEW IF SELECTED */}
      {feedDisplayMode === 'map' ? (
        <IncidentsMapView
          messages={messages}
          isAdmMode={isAdmMode}
          selectedIncidentId={selectedIncidentForMap}
          onSelectMessage={(id) => setSelectedIncidentForMap(id)}
        />
      ) : (
        <>
          {/* Media & Category Filter Bar */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-1 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800">
              {[
                { id: 'all' as const, label: 'Tudo' },
                { id: 'video' as const, label: 'Vídeos' },
                { id: 'photo' as const, label: 'Fotos' },
                { id: 'audio' as const, label: 'Áudios' },
                { id: 'text' as const, label: 'Textos' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === f.id
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedIncidentForMap(null);
                setFeedDisplayMode('map');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-900 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Ver no Radar ({messages.filter((m) => m.location).length})</span>
            </button>
          </div>

          {/* Superimposed Heatmap Overlay in Feed */}
          {showHeatmapInFeed && (
            <div id="feed-heatmap-section" className="scroll-mt-16">
              <FeedHeatmapOverlay
                messages={messages}
                onExpandToFullMap={() => setFeedDisplayMode('map')}
                onSelectIncident={(id) => {
                  setSelectedIncidentForMap(id);
                  setFeedDisplayMode('map');
                }}
              />
            </div>
          )}

          {/* ==============================================================
              BARRA DE REPORTE ESTILO WHATSAPP (SIMPLES, SUTIL E DISCRETA)
              Mecanismos solicitados:
              - Foto
              - Vídeo
              - Chamada
              - Mensagem escrita digitada
              - Tirar foto
              Menos chamativo, limpo e direto como no WhatsApp
             ============================================================== */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-3 shadow-xl space-y-2.5 relative">
            
            {/* Top compact info strip (Identidade, Categoria, Local e Opção de Deixar no Feed) */}
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap pb-1.5 border-b border-neutral-800/70">
              {/* Identity & 24h Guarantee */}
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500 shrink-0"
                />
                <span className="font-bold text-neutral-200 text-[11px] truncate">
                  {currentUser.name} {isAdmMode ? '(ADM)' : '(VIP)'}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium shrink-0">
                  <Clock className="w-2.5 h-2.5" />
                  <span>24h no Feed</span>
                </span>
              </div>

              {/* Discrete category selector & location dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Category Chips */}
                <div className="flex items-center gap-1 bg-neutral-950/80 p-0.5 rounded-lg border border-neutral-800">
                  {[
                    { id: 'transito' as const, label: 'Trânsito' },
                    { id: 'alerta' as const, label: 'Alerta' },
                    { id: 'ocorrencia' as const, label: 'Ocorrência' },
                    { id: 'informacao' as const, label: 'Info' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        selectedCategory === c.id
                          ? 'bg-emerald-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Location selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="px-2 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[10px] font-medium flex items-center gap-1 transition-colors max-w-[130px]"
                    title="Alterar local"
                  >
                    <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedLocation.name.split(' ')[0]}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                  </button>

                  {showLocationDropdown && (
                    <div className="absolute right-0 top-7 w-56 bg-neutral-900 border border-neutral-700 rounded-xl p-1 shadow-2xl z-40 max-h-48 overflow-y-auto">
                      <div className="px-2 py-1 text-[9px] font-bold text-neutral-400 uppercase">
                        Local da ocorrência:
                      </div>
                      {PRESET_LOCATIONS.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                            selectedLocation.name === loc.name
                              ? 'bg-emerald-500 text-neutral-950 font-bold'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <span className="truncate">{loc.name}</span>
                          {selectedLocation.name === loc.name && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WHATSAPP ATTACHMENT TRAY (Sutil, circular e discreto como no WhatsApp) */}
            {showAttachmentMenu && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-850">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Opções de Reporte (Estilo WhatsApp)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(false)}
                    className="text-neutral-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center">
                  {/* 1. Tirar Foto com Câmera */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      directCameraInputRef.current?.click();
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    title="Tirar foto na hora com a câmera do celular"
                  >
                    <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:bg-rose-400 transition-colors">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-300 group-hover:text-white">
                      Tirar Foto
                    </span>
                  </button>

                  {/* 2. Foto da Galeria */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      directGalleryInputRef.current?.click();
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    title="Enviar foto salva na galeria"
                  >
                    <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:bg-purple-500 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-300 group-hover:text-white">
                      Foto
                    </span>
                  </button>

                  {/* 3. Filmar Vídeo */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      setIsVideoModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    title="Filmar ou carregar filmagem de ocorrência"
                  >
                    <div className="w-11 h-11 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-600/20 group-hover:bg-pink-500 transition-colors">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-300 group-hover:text-white">
                      Vídeo
                    </span>
                  </button>

                  {/* 4. Chamada de Emergência */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      setIsCallModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    title="Chamada rápida para Central 24h, PM 190 ou SAMU 192"
                  >
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-300 group-hover:text-white">
                      Chamada
                    </span>
                  </button>

                  {/* 5. Localização GPS */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      setShowLocationDropdown(true);
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    title="Definir endereço ou localização no mapa"
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 group-hover:bg-amber-500 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-300 group-hover:text-white">
                      Local
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* THE WHATSAPP INPUT BAR (Cápsula de digitação + botões clássicos do WhatsApp) */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 bg-neutral-950 border border-neutral-700/80 rounded-full px-3 py-1.5 focus-within:border-emerald-500/80 transition-colors shadow-inner">
                
                {/* WhatsApp Clip/Attachment Button */}
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-1.5 rounded-full transition-colors ${
                    showAttachmentMenu
                      ? 'text-emerald-400 bg-neutral-800'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Abrir anexos (Foto, Vídeo, Chamada, Tirar Foto)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text input (Mensagem digitada) */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Mensagem ou reporte da ocorrência..."
                  className="flex-1 bg-transparent text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none min-w-0"
                />

                {/* Direct 1-tap WhatsApp shortcut: Tirar Foto */}
                <button
                  type="button"
                  onClick={() => directCameraInputRef.current?.click()}
                  title="Tirar foto com o celular na hora"
                  className="p-1.5 text-neutral-400 hover:text-emerald-400 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Direct 1-tap WhatsApp shortcut: Chamada */}
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(true)}
                  title="Fazer chamada de emergência"
                  className="p-1.5 text-neutral-400 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp Action Button:
                  - If text is present: WhatsApp Send circle (green with white arrow)
                  - If empty: Microphone button for voice notes
              */}
              {inputText.trim() ? (
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-emerald-500/30 shrink-0"
                  title="Enviar mensagem para o Feed 24h"
                >
                  <Send className="w-4 h-4 ml-0.5 fill-neutral-950" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecordingAudio(true)}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-emerald-600/30 shrink-0"
                  title="Gravar áudio com microfone"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Live Audio Recorder Bar if active */}
          {isRecordingAudio && (
            <AudioRecordBar
              onCancel={() => setIsRecordingAudio(false)}
              onSendAudio={(dur, blobUrl) => {
                handleSendMessage(
                  undefined,
                  'audio',
                  'Nota de áudio gravada pelo celular na central.',
                  blobUrl,
                  dur
                );
                setIsRecordingAudio(false);
                showToast('Áudio de voz publicado no feed 24h com sucesso!');
              }}
              onNotification={(m) => showToast(m, 'success')}
            />
          )}

          {/* ==============================================================
              FEED DE REPORTES (FICA 24 HORAS PARA TODOS VEREM)
             ============================================================== */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ocorrências das Últimas 24 Horas</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                {filteredMessages.length} reportes ativos
              </span>
            </div>

            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 sm:p-4 rounded-3xl bg-neutral-900/80 border transition-all relative shadow-xl ${
                  msg.isPinned
                    ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-neutral-900/90 shadow-emerald-500/10'
                    : msg.isAdminReport
                    ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/15 to-neutral-900/80'
                    : 'border-neutral-800/90 hover:border-neutral-700/80'
                }`}
              >
                {/* 24-Hour Active Badge & Role Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{msg.expiresIn || 'Disponível por 24h'}</span>
                    </span>

                    {msg.isAdminReport ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 shadow-sm flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" />
                        REPORTE OFICIAL ADM
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
                        MEMBRO VIP
                      </span>
                    )}
                  </div>

                  {msg.isPinned && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      <Pin className="w-3 h-3 rotate-45" />
                      <span>Fixado pela Central</span>
                    </div>
                  )}
                </div>

                {/* Author Info Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={msg.authorAvatar}
                        alt={msg.authorName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-950" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-extrabold text-neutral-100">{msg.authorName}</span>

                        {/* CRITICAL BOT STEALTH TAG:
                            If viewer is in ADM mode, reveal the simulated bot tag!
                            If viewer is a regular member, NEVER SHOW ANY BOT TAG!
                        */}
                        {isAdmMode && msg.isBot && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                            <Bot className="w-2.5 h-2.5" />
                            [SIMULADO]
                          </span>
                        )}

                        {/* AI Analysis Tag */}
                        {msg.aiAnalyzed && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            IA Análise
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span>{msg.timeAgo}</span>
                        <span>·</span>
                        <span className="font-mono text-neutral-400">{msg.timestamp}</span>

                        {/* Location Tag on message card */}
                        {msg.location && (
                          <>
                            <span>·</span>
                            <button
                              onClick={() => handleNavigateToMap(msg)}
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20 transition-colors"
                              title="Visualizar este incidente no mapa GPS"
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                                {msg.location.name}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Menu (Pin, Edit, Delete) */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id)
                      }
                      className="w-7 h-7 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuMsgId === msg.id && (
                      <div className="absolute right-0 top-8 w-44 rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl p-1.5 z-30 backdrop-blur-md">
                        <button
                          onClick={() => handleDeleteForEveryone(msg.id)}
                          className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Apagar para todos</span>
                        </button>
                        <button
                          onClick={() => handleTogglePin(msg.id)}
                          className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-emerald-400 hover:bg-emerald-950/40 flex items-center gap-2 font-medium"
                        >
                          <Pin className="w-3.5 h-3.5" />
                          <span>{msg.isPinned ? 'Desafixar' : 'Fixar no topo'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessage(msg);
                            setActiveMenuMsgId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2 font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar texto</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Media Rendering: Functional Video Player */}
                {msg.type === 'video' && (
                  <div className="my-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                      <Video className="w-3 h-3" />
                      <span>FILMAGEM REGISTRADA (24H NO FEED)</span>
                    </div>
                    <VideoPlayer
                      videoUrl={msg.mediaUrl}
                      duration={msg.duration || '00:24'}
                      locationName={msg.location?.name || 'Câmera Operacional'}
                      onNotification={(m) => showToast(m, 'info')}
                    />
                  </div>
                )}

                {/* Media Rendering: Functional Audio Player */}
                {msg.type === 'audio' && (
                  <div className="my-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      <Mic className="w-3 h-3" />
                      <span>ÁUDIO DE VOZ REGISTRADO (24H NO FEED)</span>
                    </div>
                    <AudioPlayer
                      audioUrl={msg.mediaUrl}
                      duration={msg.duration || '00:47'}
                      label={msg.categoryLabel}
                      onNotification={(m) => showToast(m, 'info')}
                    />
                  </div>
                )}

                {/* Media Rendering: Chamada de Emergência Registrada */}
                {msg.type === 'chamada' && (
                  <div className="my-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">CHAMADA DE EMERGÊNCIA REGISTRADA (24H)</span>
                        <span className="text-[11px] text-emerald-300 font-medium">Acionamento 24h comunicado aos membros</span>
                      </div>
                    </div>
                    <a
                      href="tel:190"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Ligar</span>
                    </a>
                  </div>
                )}

                {/* Media Rendering: Functional Photo Card */}
                {(msg.type === 'photo' || (msg.mediaUrl && msg.type !== 'video' && msg.type !== 'audio')) && (
                  <div className="my-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      <Camera className="w-3 h-3" />
                      <span>FOTO REGISTRADA COM GPS (24H NO FEED)</span>
                    </div>
                    <div
                      onClick={() => setViewingPhotoMessage(msg)}
                      className="rounded-2xl overflow-hidden border border-neutral-800 relative group cursor-pointer bg-neutral-950 shadow-lg"
                    >
                      <img
                        src={
                          msg.mediaUrl ||
                          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80'
                        }
                        alt="Foto anexada"
                        className="w-full h-52 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-4 py-2 rounded-xl bg-black/85 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md">
                          <Maximize2 className="w-4 h-4 text-emerald-400" />
                          <span>Clique para abrir foto em tela cheia</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <p className="text-sm text-neutral-200 leading-relaxed mt-1 font-normal">
                  {msg.content}
                </p>

                {/* Card Footer: Confirmation Reactions and AI Validation */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <div className="flex items-center gap-2">
                    {/* Confirm incident button */}
                    <button
                      onClick={() => handleToggleConfirmReaction(msg.id)}
                      className="px-2.5 py-1 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 border border-neutral-800 flex items-center gap-1.5 transition-colors active:scale-95"
                      title="Confirmar ocorrência"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold">Confirmar ({reactions[msg.id] || 1})</span>
                    </button>

                    {/* Ver no mapa button */}
                    {msg.location && (
                      <button
                        onClick={() => handleNavigateToMap(msg)}
                        className="px-2.5 py-1 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 border border-neutral-800 flex items-center gap-1.5 transition-colors"
                        title="Abrir no Mapa GPS"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold">Ver no Mapa</span>
                      </button>
                    )}
                  </div>

                  {msg.aiClassification && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {msg.aiClassification}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ==============================================================
          BOTÃO FLUTUANTE REDONDINHO DO MAPA DE CALOR
          "um botão para o mapa de calor, um botão flutuante redondinho que
           chama atenção, sem chamar muita atenção, escrito mapa de calor,
           para quando a pessoa quiser saber, clicar nele."
         ============================================================== */}
      <button
        type="button"
        onClick={() => {
          setFeedDisplayMode('feed');
          setShowHeatmapInFeed(true);
          setTimeout(() => {
            const el = document.getElementById('feed-heatmap-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              window.scrollTo({ top: 80, behavior: 'smooth' });
            }
          }, 80);
          showToast('🔥 Mapa de Calor ativado! Arraste com o dedo para navegar.', 'info');
        }}
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 px-3.5 py-2.5 rounded-full bg-neutral-950/95 hover:bg-neutral-900 border-2 border-amber-400 shadow-xl shadow-amber-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-neutral-100 group cursor-pointer backdrop-blur-md"
        title="Abrir Mapa de Calor de Ocorrências em tempo real"
      >
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Flame className="w-4 h-4 text-amber-400 fill-amber-400/40 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-black tracking-wide text-amber-300 drop-shadow-sm">
          Mapa de Calor
        </span>
      </button>

      {/* Video Record Modal (Film with mobile camera or live viewfinder) */}
      <VideoRecordModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSubmitVideo={(videoData) => {
          setFeedDisplayMode('feed');
          setFilterType('all');
          setSelectedLocation(videoData.location);
          setSelectedCategory(videoData.category);
          handleSendMessage(
            undefined,
            'video',
            videoData.caption,
            videoData.videoUrl,
            videoData.duration,
            videoData.location,
            videoData.category
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('📹 Filmagem deixada no Feed 24h para todos os membros!');
        }}
        onNotification={(m) => showToast(m, 'info')}
      />

      {/* Photo Upload Modal (Take photo with mobile camera or upload from gallery) */}
      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        onSubmitPhoto={(photoData) => {
          setFeedDisplayMode('feed');
          setFilterType('all');
          setSelectedLocation(photoData.location);
          setSelectedCategory(photoData.category);
          handleSendMessage(
            undefined,
            'photo',
            photoData.caption,
            photoData.imageUrl,
            undefined,
            photoData.location,
            photoData.category
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('📷 Foto deixada no Feed 24h para todos os membros!');
        }}
        onNotification={(m) => showToast(m, 'info')}
      />

      {/* Quick Report Text Modal */}
      <QuickReportModal
        isOpen={isQuickReportOpen}
        onClose={() => setIsQuickReportOpen(false)}
        onSubmitText={(reportData) => {
          setFeedDisplayMode('feed');
          setFilterType('all');
          setSelectedLocation(reportData.location);
          setSelectedCategory(reportData.category);
          handleSendMessage(
            undefined,
            'text',
            reportData.content,
            undefined,
            undefined,
            reportData.location,
            reportData.category
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('Reporte publicado no Feed 24h!');
        }}
        onOpenVideo={() => setIsVideoModalOpen(true)}
        onOpenPhoto={() => setIsPhotoUploadOpen(true)}
        onOpenAudio={() => setIsRecordingAudio(true)}
      />

      {/* Call Emergency Modal (WhatsApp style dispatch and emergency lines) */}
      <CallEmergencyModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onPostCallReport={(callData) => {
          setFeedDisplayMode('feed');
          setFilterType('all');
          setSelectedLocation(callData.location);
          setSelectedCategory('alerta');
          handleSendMessage(
            undefined,
            'chamada',
            `${callData.notes} Destino: ${callData.destination} (${callData.number})`,
            undefined,
            undefined,
            callData.location,
            'alerta'
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast(`📞 Chamada para ${callData.destination} deixada no Feed 24h!`);
        }}
      />

      {/* High-Resolution Photo Viewer Modal */}
      <PhotoViewerModal
        message={viewingPhotoMessage}
        onClose={() => setViewingPhotoMessage(null)}
        onNavigateToMap={(msg) => handleNavigateToMap(msg)}
        onNotification={(m) => showToast(m, 'info')}
      />

      {/* Edit Message Modal */}
      <EditMessageModal
        message={editingMessage}
        isOpen={editingMessage !== null}
        onClose={() => setEditingMessage(null)}
        onSave={handleSaveEditedContent}
      />
    </div>
  );
};
