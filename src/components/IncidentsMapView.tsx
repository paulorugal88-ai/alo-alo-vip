// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  AlertTriangle,
  MapPin,
  Sparkles,
  Bot,
  Car,
  Shield,
  Eye,
  Radio,
  Clock,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Flame,
  Sliders,
  Maximize2,
  Crosshair,
  HandMetal
} from 'lucide-react';
import { FeedMessage, ReportCategory } from '../types';
import { HeatmapOverlayLayer, HeatmapPoint } from './HeatmapOverlayLayer';

interface IncidentsMapViewProps {
  messages: FeedMessage[];
  isAdmMode: boolean;
  selectedIncidentId?: string | null;
  onSelectMessage?: (messageId: string) => void;
}

const DEFAULT_CENTER = { lat: -23.5614, lng: -46.6559 }; // Av. Paulista, São Paulo

// Quick Neighborhood Jump Coordinates for easy mobile exploration
const POPULAR_LOCATIONS = [
  { name: 'Av. Paulista', lat: -23.5614, lng: -46.6559, zoom: 15 },
  { name: 'Centro / Praça da Sé', lat: -23.5505, lng: -46.6333, zoom: 15 },
  { name: 'Pinheiros / Faria Lima', lat: -23.5673, lng: -46.6934, zoom: 15 },
  { name: 'Moema / Congonhas', lat: -23.6053, lng: -46.6664, zoom: 15 },
  { name: 'Tatuapé / Z. Leste', lat: -23.5404, lng: -46.5765, zoom: 14 },
  { name: 'Santana / Z. Norte', lat: -23.5019, lng: -46.6247, zoom: 14 },
  { name: 'Morumbi / Z. Sul', lat: -23.5996, lng: -46.7176, zoom: 14 },
];

// Inner helper component to pan/zoom map programmatically without interfering with finger dragging
function MapCameraController({
  target,
}: {
  target: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo({ lat: target.lat, lng: target.lng });
    if (target.zoom) {
      map.setZoom(target.zoom);
    }
  }, [map, target]);

  return null;
}

// On-screen finger zoom & pan controls
function TouchMapControls({
  onCenterSp,
}: {
  onCenterSp: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 13) + 1);
  };

  const handleZoomOut = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 13) - 1);
  };

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
      <button
        type="button"
        onClick={handleZoomIn}
        className="w-9 h-9 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95 transition-all text-base font-bold"
        title="Aproximar (+)"
      >
        <ZoomIn className="w-4 h-4 text-emerald-400" />
      </button>

      <button
        type="button"
        onClick={handleZoomOut}
        className="w-9 h-9 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95 transition-all text-base font-bold"
        title="Afastar (-)"
      >
        <ZoomOut className="w-4 h-4 text-emerald-400" />
      </button>

      <button
        type="button"
        onClick={onCenterSp}
        className="w-9 h-9 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95 transition-all"
        title="Centralizar na Av. Paulista"
      >
        <Crosshair className="w-4 h-4 text-amber-400" />
      </button>
    </div>
  );
}

export const IncidentsMapView: React.FC<IncidentsMapViewProps> = ({
  messages,
  isAdmMode,
  selectedIncidentId,
  onSelectMessage,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<FeedMessage | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [enableHeatmap, setEnableHeatmap] = useState<boolean>(true);
  const [heatmapRadius, setHeatmapRadius] = useState<number>(40);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.85);
  const [showHeatmapControls, setShowHeatmapControls] = useState<boolean>(false);
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // If selectedIncidentId is passed from feed, fly to it
  useEffect(() => {
    if (selectedIncidentId) {
      const match = messages.find((m) => m.id === selectedIncidentId);
      if (match && match.location) {
        setSelectedIncident(match);
        setTargetLocation({ lat: match.location.lat, lng: match.location.lng, zoom: 16 });
      }
    }
  }, [selectedIncidentId, messages]);

  // Filter messages that have location coordinates
  const localizedIncidents = messages.filter(
    (m) => m.location && (filterCategory === 'all' || m.category === filterCategory)
  );

  // Build heatmap points with weights
  const heatmapPoints: HeatmapPoint[] = localizedIncidents.map((m) => {
    let weight = 1.0;
    if (m.category === 'alerta') weight = 3.5;
    if (m.category === 'ocorrencia') weight = 2.5;
    if (m.category === 'transito') weight = 2.0;

    return {
      lat: m.location!.lat,
      lng: m.location!.lng,
      weight,
    };
  });

  const getMarkerColor = (category: ReportCategory) => {
    switch (category) {
      case 'alerta':
        return { background: '#ef4444', glyphColor: '#ffffff', borderColor: '#b91c1c' };
      case 'transito':
        return { background: '#10b981', glyphColor: '#ffffff', borderColor: '#047857' };
      case 'ocorrencia':
        return { background: '#f59e0b', glyphColor: '#000000', borderColor: '#d97706' };
      case 'audio':
        return { background: '#06b6d4', glyphColor: '#ffffff', borderColor: '#0891b2' };
      default:
        return { background: '#8b5cf6', glyphColor: '#ffffff', borderColor: '#6d28d9' };
    }
  };

  const handleSelectIncident = (incident: FeedMessage) => {
    setSelectedIncident(incident);
    if (incident.location) {
      setTargetLocation({ lat: incident.location.lat, lng: incident.location.lng, zoom: 15 });
    }
    if (onSelectMessage) {
      onSelectMessage(incident.id);
    }
  };

  const handleJumpToNeighborhood = (loc: { lat: number; lng: number; zoom: number }) => {
    setTargetLocation({ lat: loc.lat, lng: loc.lng, zoom: loc.zoom });
  };

  return (
    <div className="space-y-3">
      {/* Map Control Bar */}
      <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Radar da Cidade · Ocorrências Mapeadas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              {localizedIncidents.length} ocorrências no mapa · Toque e arraste livremente com o dedo
            </p>
          </div>
        </div>

        {/* Action Buttons: Heatmap Toggle & Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Prominent Heatmap Toggle Button */}
          <button
            onClick={() => setEnableHeatmap(!enableHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border active:scale-95 ${
              enableHeatmap
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/25 ring-2 ring-amber-500/30'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
            title="Ativar/desativar camada de calor das ocorrências"
          >
            <Flame className={`w-3.5 h-3.5 ${enableHeatmap ? 'fill-neutral-950 text-neutral-950' : 'text-amber-400'}`} />
            <span>Mapa de Calor: {enableHeatmap ? 'LIGADO' : 'DESLIGADO'}</span>
            {enableHeatmap && (
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            )}
          </button>

          {enableHeatmap && (
            <button
              onClick={() => setShowHeatmapControls(!showHeatmapControls)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1"
              title="Ajustar intensidade e raio da mancha de calor"
            >
              <Sliders className="w-3 h-3" />
              <span>{heatmapRadius}px</span>
            </button>
          )}

          <div className="h-4 w-px bg-neutral-800 mx-0.5" />

          {/* Category Filter Chips */}
          {[
            { id: 'all', label: 'Todos' },
            { id: 'alerta', label: 'Alertas' },
            { id: 'ocorrencia', label: 'Ocorrências' },
            { id: 'transito', label: 'Trânsito' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Sliders Drawer */}
      {enableHeatmap && showHeatmapControls && (
        <div className="p-3 bg-neutral-900/95 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs flex-wrap animate-fade-in shadow-xl">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Ajuste da Concentração de Calor:</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 font-medium">Raio do Calor:</span>
              <input
                type="range"
                min="20"
                max="75"
                value={heatmapRadius}
                onChange={(e) => setHeatmapRadius(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
              />
              <span className="text-amber-400 font-mono font-bold">{heatmapRadius}px</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 font-medium">Opacidade:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
              />
              <span className="text-amber-400 font-mono font-bold">
                {Math.round(heatmapOpacity * 100)}%
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setHeatmapRadius(25); setHeatmapOpacity(0.65); }}
                className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
              >
                Suave
              </button>
              <button
                onClick={() => { setHeatmapRadius(45); setHeatmapOpacity(0.85); }}
                className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
              >
                Normal
              </button>
              <button
                onClick={() => { setHeatmapRadius(65); setHeatmapOpacity(0.95); }}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
              >
                Forte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Jump Neighborhoods Carousel: Helps finding places instantly with 1 tap */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        <span className="text-[11px] font-bold text-neutral-400 whitespace-nowrap flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>Ir para bairro:</span>
        </span>
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            type="button"
            onClick={() => handleJumpToNeighborhood(loc)}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-emerald-950/60 text-neutral-300 hover:text-emerald-300 border border-neutral-800 text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95"
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Touch Instruction Banner */}
      <div className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
          <HandMetal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Arraste com o dedo em qualquer direção para navegar e encontrar os locais da cidade.</span>
        </span>
        {enableHeatmap && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            Calor Sobreposto
          </span>
        )}
      </div>

      {/* Google Maps Container with 100% Free Finger Dragging */}
      <div className="relative w-full h-[430px] sm:h-[500px] rounded-2xl overflow-hidden border border-emerald-950/80 shadow-2xl bg-neutral-950">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={true}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
        >
          {/* Camera panning controller for programmatic clicks */}
          <MapCameraController target={targetLocation} />

          {/* On-screen touch zoom & recenter buttons */}
          <TouchMapControls onCenterSp={() => setTargetLocation({ lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, zoom: 14 })} />

          {/* Superimposed Heatmap Layer */}
          <HeatmapOverlayLayer
            points={heatmapPoints}
            radius={heatmapRadius}
            opacity={heatmapOpacity}
            visible={enableHeatmap}
          />

          {/* Incident Pins */}
          {localizedIncidents.map((incident) => {
            if (!incident.location) return null;
            const colors = getMarkerColor(incident.category);
            return (
              <AdvancedMarker
                key={incident.id}
                position={{ lat: incident.location.lat, lng: incident.location.lng }}
                onClick={() => handleSelectIncident(incident)}
                title={`${incident.categoryLabel}: ${incident.location.name}`}
              >
                <div className="cursor-pointer transition-transform hover:scale-110 active:scale-95">
                  <Pin
                    background={colors.background}
                    borderColor={colors.borderColor}
                    glyphColor={colors.glyphColor}
                    scale={1.15}
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow for selected incident */}
          {selectedIncident && selectedIncident.location && (
            <InfoWindow
              position={{
                lat: selectedIncident.location.lat,
                lng: selectedIncident.location.lng,
              }}
              onCloseClick={() => setSelectedIncident(null)}
            >
              <div className="p-1 max-w-[270px] text-neutral-900 font-sans">
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={selectedIncident.authorAvatar}
                    alt={selectedIncident.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-300"
                  />
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <strong className="text-xs font-bold text-neutral-950">
                        {selectedIncident.authorName}
                      </strong>
                      {isAdmMode && selectedIncident.isBot && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          [SIMULADO]
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-600 font-mono">
                      {selectedIncident.timeAgo} · {selectedIncident.timestamp}
                    </span>
                  </div>
                </div>

                {/* Location Title */}
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mb-1.5 border border-emerald-200">
                  <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span className="truncate">{selectedIncident.location.name}</span>
                </div>

                {/* Incident Text Content */}
                <p className="text-xs text-neutral-800 leading-snug line-clamp-3 mb-2 font-medium">
                  {selectedIncident.content}
                </p>

                {/* Media Preview if attached */}
                {selectedIncident.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-neutral-200 max-h-24">
                    {selectedIncident.type === 'video' ? (
                      <video
                        src={selectedIncident.mediaUrl}
                        className="w-full h-24 object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={selectedIncident.mediaUrl}
                        alt="Evidência"
                        className="w-full h-24 object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[10px]">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider">
                    {selectedIncident.categoryLabel}
                  </span>
                  <span className="text-neutral-500 font-mono">
                    GPS: {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Heatmap Intensity Legend */}
        {enableHeatmap && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto bg-neutral-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-amber-500/30 flex items-center justify-between sm:justify-start gap-3 text-[11px] shadow-xl z-20 pointer-events-none">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="text-amber-300 font-bold">Concentração de Calor:</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-24 sm:w-28 rounded-full overflow-hidden bg-gradient-to-r from-cyan-400 via-green-400 via-yellow-400 to-red-600 shadow-inner" />
              <div className="flex items-center gap-1 text-[10px] text-neutral-300 font-mono">
                <span className="text-emerald-400">Normal</span>
                <span>→</span>
                <span className="text-rose-400 font-bold">Crítica</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
