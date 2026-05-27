import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import type { AvatarViewerHandle } from '../media/AvatarViewer';

// Deferred chunk — Three.js (~1.5 MB) loads after first paint, not blocking it
const AvatarViewer = lazy(() =>
  import('../media/AvatarViewer').then(m => ({ default: m.AvatarViewer }))
);

function useMobileTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
      }));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);
  return time;
}

interface AnimEntry {
  url:      string;
  label:    string;
  group:    string;
  duration: number; // ms — how long before auto-reverting to a random idle
}

const ANIMATIONS: AnimEntry[] = [
  // ── Idle ──────────────────────────────────────────────────────────────
  { url: '/uploads/animate_idle_1.fbx',       label: 'Idle 1',  group: 'Idle',    duration: 5000 },
  { url: '/uploads/animate_idle_4.fbx',       label: 'Idle 2',  group: 'Idle',    duration: 30000 },
  { url: '/uploads/animate_idle_2.fbx',       label: 'LookUp 1',group: 'Idle',    duration: 1000 },
  { url: '/uploads/animate_idle_3.fbx',       label: 'LookUp 2', group: 'Idle',   duration: 1000 },
  { url: '/uploads/animate_idle_sad.fbx',     label: 'Sad',     group: 'Idle',    duration: 20000 },
  { url: '/uploads/animate_idle_sp.fbx',      label: 'Special', group: 'Idle',    duration: 12000 },
  { url: '/uploads/animate_idle_dodge.fbx',   label: 'Dodge',   group: 'Idle',    duration:  1000 },
  // { url: '/uploads/animate_idle_lying.fbx',   label: 'Lying',   group: 'Idle',    duration: 25000 },
  // ── Wave ──────────────────────────────────────────────────────────────
  { url: '/uploads/animate_idle_wave.fbx',    label: 'Wave',    group: 'Wave',    duration:  1000 },
  { url: '/uploads/animate_idle_wave_2.fbx',  label: 'Wave 2',  group: 'Wave',    duration:  1000 },
  { url: '/uploads/animate_idle_wave_4.fbx',  label: 'Wave 4',  group: 'Wave',    duration:  1000 },
  { url: '/uploads/animate_idle_wave_5.fbx',  label: 'Wave 5',  group: 'Wave',    duration:  1000 },
  // ── Dance ─────────────────────────────────────────────────────────────
  { url: '/uploads/animate_dance_1.fbx',      label: 'Dance 1', group: 'Dance',   duration: 15000 },
  { url: '/uploads/animate_idle_wave_3.fbx',  label: 'Dance 2', group: 'Dance',   duration: 15000 },
  // ── Jump ──────────────────────────────────────────────────────────────
  { url: '/uploads/animate_jump_1.fbx',       label: 'Jump 1',  group: 'Jump',    duration:  5000 },
  { url: '/uploads/animate_jump_2.fbx',       label: 'Jump 2',  group: 'Jump',    duration:  5000 },
  // ── Sitting ───────────────────────────────────────────────────────────
  { url: '/uploads/animate_sitting_1.fbx',    label: 'Sitting', group: 'Sitting', duration: 5000 },
  // ── Running ───────────────────────────────────────────────────────────
  // { url: '/uploads/animate_wave_5.fbx',       label: 'Run',     group: 'Run',     duration: 10000 },
];

const ANIM_GROUPS = Array.from(new Set(ANIMATIONS.map(a => a.group)));

export function Hero() {
  const mobileTime     = useMobileTime();
  const viewerRef      = useRef<AvatarViewerHandle>(null);
  const pickerRef      = useRef<HTMLDivElement>(null);
  const animBtnRef     = useRef<HTMLButtonElement>(null);
  const revertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pickerOpen,    setPickerOpen]    = useState(false);
  const [activeAnim,    setActiveAnim]    = useState('');
  // Defer Three.js until the browser is idle so it doesn't block FCP / reveal animations
  const [avatarMounted, setAvatarMounted] = useState(false);

  // Mount Three.js only after the browser goes idle — keeps it off the critical render path
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setAvatarMounted(true), { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => setAvatarMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Clear revert timer on unmount
  useEffect(() => () => { if (revertTimerRef.current) clearTimeout(revertTimerRef.current); }, []);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (
        pickerRef.current  && !pickerRef.current.contains(e.target as Node) &&
        animBtnRef.current && !animBtnRef.current.contains(e.target as Node)
      ) setPickerOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pickerOpen]);

  function handlePlayAnim(anim: AnimEntry) {
    // Cancel any pending revert
    if (revertTimerRef.current) clearTimeout(revertTimerRef.current);

    viewerRef.current?.playClip(anim.url);
    setActiveAnim(anim.url);
    setPickerOpen(false);

    // Auto-revert to idle_4 after this animation's duration
    revertTimerRef.current = setTimeout(() => {
      viewerRef.current?.playClip('/uploads/animate_idle_4.fbx');
      setActiveAnim('');
    }, anim.duration);
  }

  return (
    <section id="home" className="hero">
      {/* Mobile-only topbar — V1 Classic Stacked */}
      <div className="hero-mob-topbar">
        <button className="hero-mob-menu" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <span className="hero-mob-brand">DEEPAK · SINGH · '26</span>
        <div className="hero-mob-status">
          <span className="dot"></span>BLR · {mobileTime}
        </div>
      </div>

      <div className="container">
        <div className="hero-grid">
          {/* Full-width absolute layer — avatar can animate freely without clipping */}
          <div className="hero-avatar reveal">
            <div className="avatar-frame">
              <div className="avatar-ground"></div>
              {avatarMounted
                ? <Suspense fallback={<div className="avatar-3d" />}>
                    <AvatarViewer
                      ref={viewerRef}
                      fov={22} camY={1.05} camZ={5} lookAtRel={0.58}
                      avatarUrl="/uploads/second_avatar.glb"
                      interactive={false} autoRotate={false} startRotY={0}
                      initialClips={[
                        '/uploads/animate_idle_wave_3.fbx',  // Stage 1 — Dance 2
                        '/uploads/animate_idle_wave.fbx',    // Stage 2 — Wave
                        '/uploads/animate_idle_neutral.fbx', // Stage 3 — Neutral (loops forever)
                      ]}
                      cyclesMs={15000}
                      cycles2Ms={5000}
                    />
                  </Suspense>
                : <div className="avatar-3d" />
              }
            </div>
          </div>

          {/* Animation picker control */}
          <div className="hero-avatar-controls">
            <div className="hero-ctrl-wrap">
              <button
                ref={animBtnRef}
                className={`hero-ctrl-btn${pickerOpen ? ' active' : ''}`}
                onClick={() => setPickerOpen(o => !o)}
                aria-label="Change animation"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                <span className="hero-btn-text">Animate</span>
              </button>

              {pickerOpen && (
                <div ref={pickerRef} className="anim-picker">
                  {ANIM_GROUPS.map(group => (
                    <div key={group} className="anim-picker-group">
                      <div className="anim-group-label">{group}</div>
                      <div className="anim-picker-items">
                        {ANIMATIONS.filter(a => a.group === group).map(anim => (
                          <button
                            key={anim.url}
                            className={`anim-picker-item${activeAnim === anim.url ? ' active' : ''}`}
                            onClick={() => handlePlayAnim(anim)}
                            title={`plays for ${anim.duration / 1000}s`}
                          >
                            {anim.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hero-foot">
            <div className="col reveal" data-d="2">
              <strong>{'>'} whoami</strong><br />
              Python backend engineer building scalable AI systems —
              real-time LLM pipelines, microservices, and the setup
              that keeps the flow running.
            </div>
            <div className="col right reveal" data-d="3">
              <strong>Software Engineer @ Openstream.ai</strong><br />
              <span className="col-desc">
                Exploring how AI and real-time systems can merge
                into something that feels less like software
                and more like conversation.
              </span>
            </div>
          </div>

          <h1 className="hero-name reveal" data-d="1">
            <span className="word">DEEPAK</span>
            <span className="gap" aria-hidden="true"></span>
            <span className="word w2">SINGH</span>
          </h1>
        </div>

        <div className="hero-tag reveal" data-d="4">
          <span>scroll</span>
          <span className="cursor"></span>
          <span>to explore</span>
        </div>
      </div>
    </section>
  );
}
