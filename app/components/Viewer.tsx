"use client";
import React, { useEffect, useRef } from 'react';
import Marzipano from 'marzipano';
import panoImage from '../ydc.jpeg';

const panoConfig = {
  settings: {
    mouseViewMode: 'drag'
  },
  scenes: [
    {
      id: 'scene-1',
      name: 'Main Room',
      imageUrl: panoImage.src || panoImage,
      initialViewParameters: {
        yaw: 0,
        pitch: 0,
        fov: Math.PI / 2
      },
      hotspots: [
        {
          id: 'hs-1',
          yaw: 5,
          pitch: -0.3,
          title: 'Welcome Center',
          text: 'Yeh main entrance hai.',
          type: 'info'
        }
      ]
    }
  ]
};

export default function Viewer() {
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!panoRef.current) return;

    const viewerOpts = {
      controls: {
        mouseViewMode: panoConfig.settings.mouseViewMode
      }
    };

    const viewer = new Marzipano.Viewer(panoRef.current, viewerOpts);
    viewerRef.current = viewer;

    const sceneData = panoConfig.scenes[0];
    const source = Marzipano.ImageUrlSource.fromString(sceneData.imageUrl);
    const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);

    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (100 * Math.PI) / 180
    );

    const view = new Marzipano.RectilinearView(
      sceneData.initialViewParameters,
      limiter
    );

    const scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    scene.switchTo();

    sceneData.hotspots.forEach((hs) => {
      const container = document.createElement('div');
      container.className = 'hotspot-container';

      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'hotspot-icon';
      iconWrapper.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;

      const tooltip = document.createElement('div');
      tooltip.className = 'hotspot-tooltip';
      tooltip.innerHTML = `<strong>${hs.title}</strong><p>${hs.text}</p>`;

      container.appendChild(iconWrapper);
      container.appendChild(tooltip);

      scene.hotspotContainer().createHotspot(container, {
        yaw: hs.yaw,
        pitch: hs.pitch
      });
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      <div ref={panoRef} style={{ width: '100%', height: '100%' }} />
      <style>{`
        .hotspot-container {
          position: absolute;
          cursor: pointer;
        }
        .hotspot-icon {
          width: 36px;
          height: 36px;
          background-color: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .hotspot-container:hover .hotspot-icon {
          transform: scale(1.15);
        }
        .hotspot-tooltip {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: 45px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #0f172a;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 6px;
          width: 150px;
          text-align: center;
          font-size: 12px;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .hotspot-container:hover .hotspot-tooltip {
          visibility: visible;
          opacity: 1;
        }
        .hotspot-tooltip strong {
          display: block;
          font-size: 12px;
          color: #ffffff;
        }
        .hotspot-tooltip p {
          margin: 2px 0 0 0;
          font-size: 11px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}