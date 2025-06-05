import { useEffect, useRef, useState } from 'react';
import { scanDrug, type DrugInfo } from './services/aiGateway';

export default function DrugScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [info, setInfo] = useState<DrugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Nem sikerült elindítani a kamerát');
      }
    }
    init();
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach(t => t.stop());
    };
  }, []);

  async function handleScan() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setLoading(true);
    setError(null);
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg'));
      if (!blob) throw new Error('Nem sikerült képet készíteni');
      const result = await scanDrug(blob);
      setInfo(result);
    } catch (err) {
      setError((err as Error).message);
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Gyógyszerfelismerés</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: 400 }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={handleScan} disabled={loading}>Beolvasás</button>
      </div>
      {loading && <p>Feldolgozás...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {info && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '0.5rem' }}>
          <h3>{info.name}</h3>
          <p><b>Hatóanyag:</b> {info.activeSubstance}</p>
          <p><b>Javallat:</b> {info.indication}</p>
          <p><b>Figyelmeztetések:</b> {info.warnings}</p>
        </div>
      )}
    </div>
  );
}
