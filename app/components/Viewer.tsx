"use client";
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore: no declaration file for marzipano
import Marzipano from 'marzipano';
import axios from 'axios';

interface Hotspot {
    id: string;
    yaw: number;
    pitch: number;
    title?: string;
    text?: string;
    type?: string;
    targetSceneId?: string;
}

interface Scene {
    id: string;
    name: string;
    imageUrl: string;
    initialViewParameters: {
        yaw: number;
        pitch: number;
        fov: number;
    };
    hotspots?: Hotspot[];
}

interface ApiResponse {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    config: {
        settings: {
            mouseViewMode: string;
        };
        scenes: Scene[];
    };
}

export default function Viewer() {
    const panoRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const [panoData, setPanoData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get<ApiResponse>('/api/tour');
                setPanoData(response.data);
            } catch (err) {
                setError('Panorama configuration load hone mein dikkat aayi');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    useEffect(() => {
        if (!panoData || !panoRef.current || !panoData.config?.scenes?.length) return;

        const { settings, scenes } = panoData.config;

        const viewerOpts = {
            controls: {
                mouseViewMode: settings?.mouseViewMode || 'drag'
            }
        };

        const viewer = new Marzipano.Viewer(panoRef.current, viewerOpts);
        viewerRef.current = viewer;

        const scenesMap: { [key: string]: any } = {};

        scenes.forEach((sceneData) => {
            const source = Marzipano.ImageUrlSource.fromString(sceneData.imageUrl);
            const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);

            const limiter = Marzipano.RectilinearView.limit.traditional(
                6096,
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

            scenesMap[sceneData.id] = {
                data: sceneData,
                marzipanoScene: scene
            };

            const hotspots = sceneData.hotspots || [];
            hotspots.forEach((hs) => {
                const container = document.createElement('div');
                container.className = 'hotspot-container';

                const iconWrapper = document.createElement('div');
                iconWrapper.className = `hotspot-icon ${hs.type === 'link' ? 'link-icon' : ''}`;

                if (hs.type === 'link') {
                    iconWrapper.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
                } else {
                    iconWrapper.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
                }

                if (hs.title || hs.text) {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'hotspot-tooltip';
                    tooltip.innerHTML = `${hs.title ? `<strong>${hs.title}</strong>` : ''}${hs.text ? `<p>${hs.text}</p>` : ''}`;
                    container.appendChild(tooltip);
                }

                container.appendChild(iconWrapper);

                if (hs.type === 'link' && hs.targetSceneId) {
                    container.addEventListener('click', () => {
                        const target = scenesMap[hs.targetSceneId!];
                        if (target) {
                            target.marzipanoScene.switchTo();
                        }
                    });
                }

                scene.hotspotContainer().createHotspot(container, {
                    yaw: hs.yaw,
                    pitch: hs.pitch
                });
            });
        });

        const firstSceneId = scenes[0].id;
        if (scenesMap[firstSceneId]) {
            scenesMap[firstSceneId].marzipanoScene.switchTo();
        }

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
            }
        };
    }, [panoData]);

    if (loading) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                Loading Viewer Config...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                {error}
            </div>
        );
    }

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
        .hotspot-icon.link-icon {
          background-color: #16a34a;
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