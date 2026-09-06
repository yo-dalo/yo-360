"use client";
import dynamic from 'next/dynamic';

const Viewer = dynamic(() => import('./components/Viewer'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
      Loading 360 Viewer...
    </div>
  )
});

export default function Page() {
  return <Viewer />;
}