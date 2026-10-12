import React, { useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Sliders,
  Layers,
  MapPin,
  Sparkles,
  X,
  Radio,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Crosshair,
  HandMetal
} from 'lucide-react';
import { FeedMessage } from '../types';
import { HeatmapOverlayLayer, HeatmapPoint } from './HeatmapOverlayLayer';

interface FeedHeatmapOverlayProps {
  messages: FeedMessage[];
  onExpandToFullMap: () => void;
  onSelectIncident?: (messageId: string) => void;
}

const DEFAULT_CENTER = { lat: -23.5614, lng: -46.6559 }; // Av. Paulista, São Paulo

// Quick Neighborhood Jump for Feed Map
const FEED_QUICK_JUMPS = [
  { name: 'Paulista', lat: -23.5614, lng: -46.6559 },
  { name: 'Centro', lat: -23.5505, lng: -46.6333 },
  { name: 'Pinheiros', lat: -23.5673, lng: -46.6934 },
  { name: 'Z. Leste', lat: -23.5404, lng: -46.5765 },
  { name: 'Z. Norte', lat: -23.5019, lng: -46.6247 },
];

function FeedMapTouchControls({
  onCenterSp,
}: {
  onCenterSp: () => void;
}) {
  const map = useMap();

  return (
    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-20">
      <button
        type="button"
        onClick={() => map && map.setZoom((map.getZoom() || 13) + 1)}
        className="w-7 h-7 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95 text-xs font-bold"
        title="Aproximar (+)"
      >
        <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
      </button>

      <button
        type="button"
        onClick={() => map && map.setZoom((map.getZoom() || 13) - 1)}
        className="w-7 h-7 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95 text-xs font-bold"
        title="Afastar (-)"
      >
        <ZoomOut className="w-3.5 h-3.5 text-emerald-400" />
      </button>

      <button
        type="button"
        onClick={onCenterSp}
        className="w-7 h-7 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95"
        title="Centralizar"
      >
        <Crosshair className="w-3.5 h-3.5 text-amber-400" />
      </button>
    </div>
  );
}

function FeedMapPanController({
  target,
}: {
  target: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
  }, [map, target]);

  return null;
}

export const FeedHeatmapOverlay: React.FC<FeedHeatmapOverlayProps> = ({
  messages,
  onExpandToFullMap,
  onSelectIncident,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [radius, setRadius] = useState<number>(40);
  const [opacity, setOpacity] = useState<number>(0.85);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Extract valid points from messages with locations
  const localizedMessages = messages.filter((m) => m.location);

  // Create heatmap points with weights based on category urgency
  const heatmapPoints: HeatmapPoint[] = localizedMessages.map((m) => {
    let weight = 1;
    if (m.category === 'alerta') weight = 3.5;
    if (m.category === 'ocorrencia') weight = 2.5;
    if (m.category === 'transito') weight = 2.0;

    return {
      lat: m.location!.lat,
      lng: m.location!.lng,
      weight,
    };
  });

  return (
    <div className="rounded-2xl border-2 border-amber-500/50 bg-neutral-950/95 shadow-2xl overflow-hidden transition-all animate-fade-in">
      {/* Top Header Bar */}
      <div className="p-3 bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-amber-950/40 flex items-center justify-between gap-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-4 h-4 fill-amber-400/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>Mapa de Calor · Concentração ao Vivo</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                TEMPO REAL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {localizedMessages.length} ocorrências mapeadas · Arraste livremente com o dedo
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              showControls
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
            title="Ajustar Raio e Intensidade"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>

          <button
            type="button"
            onClick={onExpandToFullMap}
            className="px-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20"
            title="Abrir no Mapa Grande com Busca Completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tela Cheia</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title={isExpanded ? 'Recolher mapa de calor' : 'Abrir mapa de calor'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Heatmap Content */}
      {isExpanded && (
        <div>
          {/* Sliders Control Drawer */}
          {showControls && (
            <div className="p-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Heatmap Layer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    showHeatmap
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Calor: {showHeatmap ? 'Ligado' : 'Desligado'}</span>
                </button>

                {/* Markers Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMarkers(!showMarkers)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    showMarkers
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Pontos: {showMarkers ? 'Visíveis' : 'Ocultos'}</span>
                </button>
              </div>

              {/* Radius & Opacity Sliders */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400">Raio:</span>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-16 sm:w-20 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
                  />
                  <span className="text-[10px] text-amber-400 font-mono font-bold">{radius}px</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400">Opacidade:</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-16 sm:w-20 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
                  />
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick neighborhood jump pills */}
          <div className="px-2.5 py-1.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
            <span className="text-neutral-400 whitespace-nowrap font-bold flex items-center gap-1">
              <HandMetal className="w-3 h-3 text-emerald-400" />
              <span>Arraste ou clique:</span>
            </span>
            {FEED_QUICK_JUMPS.map((q) => (
              <button
                key={q.name}
                type="button"
                onClick={() => setTargetLocation({ lat: q.lat, lng: q.lng })}
                className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium whitespace-nowrap active:scale-95"
              >
                {q.name}
              </button>
            ))}
          </div>

          {/* Interactive Google Map with Superimposed Heatmap & Free Finger Dragging */}
          <div className="relative h-64 sm:h-80 w-full bg-neutral-950">
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
              {/* Programmatic panning when user taps neighborhood pill */}
              <FeedMapPanController target={targetLocation} />

              {/* Touch Zoom and Center Controls */}
              <FeedMapTouchControls onCenterSp={() => setTargetLocation(DEFAULT_CENTER)} />

              {/* Heatmap Overlay Layer using Google Maps visualization */}
              <HeatmapOverlayLayer
                points={heatmapPoints}
                radius={radius}
                opacity={opacity}
                visible={showHeatmap}
              />

              {/* Markers on top of Heatmap */}
              {showMarkers &&
                localizedMessages.map((incident) => {
                  if (!incident.location) return null;
                  return (
                    <AdvancedMarker
                      key={incident.id}
                      position={{ lat: incident.location.lat, lng: incident.location.lng }}
                      onClick={() => onSelectIncident && onSelectIncident(incident.id)}
                      title={`${incident.authorName}: ${incident.location.name}`}
                    >
                      <div className="relative group cursor-pointer active:scale-95">
                        <Pin
                          background={
                            incident.category === 'alerta'
                              ? '#ef4444'
                              : incident.category === 'ocorrencia'
                              ? '#f59e0b'
                              : '#10b981'
                          }
                          borderColor="#000000"
                          glyphColor="#ffffff"
                          scale={0.85}
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}
            </Map>

            {/* Floating Heatmap Intensity Legend */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 flex items-center justify-between text-[11px] pointer-events-none z-20">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 font-bold">Concentração:</span>
                <div className="flex items-center gap-1 h-2.5 w-24 rounded-full overflow-hidden bg-gradient-to-r from-cyan-400 via-green-400 via-yellow-400 to-red-600 shadow-inner" />
              </div>

              <div className="flex items-center gap-2 text-neutral-400 font-mono">
                <span className="text-emerald-400">Leve</span>
                <span>→</span>
                <span className="text-rose-400 font-bold">Forte</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
