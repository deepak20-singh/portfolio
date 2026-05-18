import { useState, useRef, useCallback, CSSProperties } from 'react';
import { lsGet, lsSet, lsDel } from '../../utils/persistence';

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const MAX_DIM = 1200;
const LS_PREFIX = 'image-slot:';

async function toDataUrl(file: File, targetW: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
    const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL('image/webp', 0.85);
  } finally {
    bitmap.close?.();
  }
}

type Shape = 'rect' | 'rounded' | 'circle' | 'pill';

interface Props {
  slotId: string;
  defaultSrc?: string;
  shape?: Shape;
  radius?: number;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
}

function borderRadius(shape: Shape, radius: number): string {
  if (shape === 'circle') return '50%';
  if (shape === 'pill') return '9999px';
  if (shape === 'rounded') return `${radius}px`;
  return '0';
}

export function ImageSlot({ slotId, defaultSrc, shape = 'rounded', radius = 12, placeholder = 'Drop an image', style, className }: Props) {
  const [src, setSrc] = useState<string | null>(() => {
    const v = lsGet<string | null>(`${LS_PREFIX}${slotId}`, null);
    return v && /^data:image\//i.test(v) ? v : (defaultSrc ?? null);
  });
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const depthRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const genRef = useRef(0);

  const ingest = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPT.includes(file.type)) { setError('Drop a PNG, JPEG, WebP, or AVIF image.'); return; }
    const gen = ++genRef.current;
    try {
      const w = wrapRef.current?.clientWidth || MAX_DIM;
      const url = await toDataUrl(file, w);
      if (gen !== genRef.current) return;
      lsSet(`${LS_PREFIX}${slotId}`, url);
      setSrc(url);
      setTimeout(() => setError(null), 3000);
    } catch {
      if (gen !== genRef.current) return;
      setError('Could not read that image.');
    }
  }, [slotId]);

  const clear = useCallback(() => {
    genRef.current++;
    lsDel(`${LS_PREFIX}${slotId}`);
    setSrc(null);
  }, [slotId]);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    depthRef.current++;
    setOver(true);
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (--depthRef.current <= 0) { depthRef.current = 0; setOver(false); }
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    depthRef.current = 0; setOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) ingest(f);
  };

  const br = borderRadius(shape, radius);

  return (
    <div
      ref={wrapRef}
      className={`image-slot-wrap${className ? ` ${className}` : ''}`}
      style={{ borderRadius: br, ...style }}
      data-over={over ? '' : undefined}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {src ? (
        <>
          <img className="image-slot-img" src={src} alt="" style={{ borderRadius: br }} />
          <div className="image-slot-controls">
            <button type="button" onClick={() => inputRef.current?.click()}>Replace</button>
            <button type="button" onClick={clear}>Remove</button>
          </div>
        </>
      ) : (
        <div className="image-slot-empty" style={{ borderRadius: br }} onClick={() => inputRef.current?.click()}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
          <span>{placeholder}</span>
        </div>
      )}
      {error && <div style={{ position:'absolute', left:8, bottom:8, right:8, color:'#b3261e', fontSize:11, background:'rgba(255,255,255,.85)', padding:'4px 6px', borderRadius:5, pointerEvents:'none' }}>{error}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) ingest(f); e.target.value = ''; }}
      />
    </div>
  );
}
