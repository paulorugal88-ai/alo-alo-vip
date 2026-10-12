import React, { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight?: number;
}

interface HeatmapOverlayLayerProps {
  points: HeatmapPoint[];
  radius?: number;
  opacity?: number;
  visible?: boolean;
}

export const HeatmapOverlayLayer: React.FC<HeatmapOverlayLayerProps> = ({
  points,
  radius = 38,
  opacity = 0.85,
  visible = true,
}) => {
  const map = useMap();
  const visualizationLib = useMapsLibrary('visualization');
  const heatmapRef = useRef<any>(null);
  const canvasOverlayRef = useRef<any>(null);
  const listenersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map) return;

    let useNativeHeatmap = false;

    // 1. Try native google.maps.visualization.HeatmapLayer
    try {
      const HeatmapClass =
        (visualizationLib as any)?.HeatmapLayer ||
        (window as any).google?.maps?.visualization?.HeatmapLayer;

      if (HeatmapClass && (window as any).google?.maps?.LatLng) {
        if (!heatmapRef.current) {
          heatmapRef.current = new HeatmapClass({
            radius,
            opacity,
            gradient: [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 0.8)',
              'rgba(0, 191, 255, 0.9)',
              'rgba(0, 255, 0, 0.9)',
              'rgba(255, 255, 0, 0.95)',
              'rgba(255, 127, 0, 1)',
              'rgba(255, 0, 0, 1)',
            ],
          });
        }

        const data = points.map((p) => {
          const latLng = new (window as any).google.maps.LatLng(p.lat, p.lng);
          return {
            location: latLng,
            weight: p.weight || 1,
          };
        });

        if (typeof heatmapRef.current.setData === 'function') {
          heatmapRef.current.setData(data);
        }
        if (typeof heatmapRef.current.setOptions === 'function') {
          heatmapRef.current.setOptions({ radius, opacity });
        }
        if (typeof heatmapRef.current.setMap === 'function') {
          heatmapRef.current.setMap(visible ? map : null);
        }
        useNativeHeatmap = true;
      }
    } catch (err) {
      console.warn('Native HeatmapLayer initialization notice:', err);
      useNativeHeatmap = false;
    }

    // 2. High-performance Canvas Overlay fallback if native HeatmapLayer is still loading or unavailable
    if (!useNativeHeatmap && (window as any).google?.maps?.OverlayView) {
      if (!canvasOverlayRef.current) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';

        const OverlayViewClass = (window as any).google.maps.OverlayView;
        const overlay = new OverlayViewClass();

        overlay.onAdd = function () {
          const panes = this.getPanes();
          panes?.overlayLayer.appendChild(canvas);
        };

        overlay.draw = function () {
          const projection = this.getProjection();
          if (!projection) return;

          const bounds = map.getBounds();
          if (!bounds) return;

          const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
          const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());

          if (!sw || !ne) return;

          const width = Math.abs(ne.x - sw.x);
          const height = Math.abs(sw.y - ne.y);

          canvas.width = width;
          canvas.height = height;
          canvas.style.left = `${Math.min(sw.x, ne.x)}px`;
          canvas.style.top = `${Math.min(sw.y, ne.y)}px`;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.clearRect(0, 0, width, height);

          if (!visible) return;

          ctx.globalAlpha = opacity;

          points.forEach((pt) => {
            const LatLngClass = (window as any).google.maps.LatLng;
            if (!LatLngClass) return;
            const latLng = new LatLngClass(pt.lat, pt.lng);
            const pos = projection.fromLatLngToDivPixel(latLng);
            if (!pos) return;

            const x = pos.x - Math.min(sw.x, ne.x);
            const y = pos.y - Math.min(sw.y, ne.y);
            const r = radius * (pt.weight || 1);

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)'); // Red core
            grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.7)'); // Amber
            grad.addColorStop(0.65, 'rgba(16, 185, 129, 0.45)'); // Emerald
            grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.2)'); // Cyan
            grad.addColorStop(1, 'rgba(6, 182, 212, 0)'); // Transparent

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          });
        };

        overlay.onRemove = function () {
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        };

        canvasOverlayRef.current = overlay;

        // Listen for map bounds changes to redraw canvas on user finger pan / drag
        const l1 = map.addListener('bounds_changed', () => overlay.draw());
        const l2 = map.addListener('idle', () => overlay.draw());
        listenersRef.current = [l1, l2];
      }

      canvasOverlayRef.current.setMap(visible ? map : null);
      if (typeof canvasOverlayRef.current.draw === 'function') {
        canvasOverlayRef.current.draw();
      }
    }

    return () => {
      listenersRef.current.forEach((l) => {
        if (l && typeof l.remove === 'function') l.remove();
      });
      listenersRef.current = [];

      if (heatmapRef.current && typeof heatmapRef.current.setMap === 'function') {
        heatmapRef.current.setMap(null);
      }
      if (canvasOverlayRef.current && typeof canvasOverlayRef.current.setMap === 'function') {
        canvasOverlayRef.current.setMap(null);
      }
    };
  }, [map, visualizationLib, points, radius, opacity, visible]);

  return null;
};
