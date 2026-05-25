import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Module-level caches — each URL loads exactly once, results shared across all instances
const _gltfCache = new Map<string, Promise<{ scene: THREE.Group }>>();
const _clipCache  = new Map<string, Promise<THREE.AnimationClip | null>>();
const _gltfLoader = new GLTFLoader();
const _fbxLoader  = new FBXLoader();

function loadGLTF(url: string) {
  if (!_gltfCache.has(url)) {
    _gltfCache.set(url, new Promise((res, rej) => _gltfLoader.load(url, res as never, undefined, rej)));
  }
  return _gltfCache.get(url)!;
}

function loadFBXClip(url: string): Promise<THREE.AnimationClip | null> {
  if (!_clipCache.has(url)) {
    _clipCache.set(url, new Promise((res, rej) =>
      _fbxLoader.load(url, (fbx) => {
        const clip = fbx.animations?.[0] ?? null;
        if (clip) clip.tracks.forEach(t => { t.name = t.name.replace(/^mixamorig\d*:?/i, ''); });
        res(clip);
      }, undefined, rej),
    ));
  }
  return _clipCache.get(url)!;
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => m?.dispose());
  });
}

export interface SceneAPI {
  playClip: (url: string) => void;
}

export interface ThreeSceneOpts {
  avatarUrl?:       string;
  initialClips?:    string[];
  fov?:             number;
  camX?:            number;
  camY?:            number;
  camZ?:            number;
  exposure?:        number;
  lookAtRel?:       number;
  startRotY?:       number;
  interactive?:     boolean;
  autoRotate?:      boolean;
  autoRotateDelay?: number;
  autoRotateSpeed?: number;
  cyclesMs?:        number;
  cycles2Ms?:       number; // duration of second clip before settling into the third (idle)
}

const DEFAULT_AVATAR        = '/uploads/first_avatar.glb';
const DEFAULT_GREET_URL     = '/uploads/animate_idle_wave.fbx';
const DEFAULT_IDLE_URL      = '/uploads/animate_idle_neutral.fbx';
const DEFAULT_GREET_DURATION = 6000; // ms — how long wave plays before settling into idle

export function useThreeScene(opts: ThreeSceneOpts = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef       = useRef<SceneAPI | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const SkeletonUtils = await import('three/examples/jsm/utils/SkeletonUtils.js');
        if (cancelled) return;

        const avatarUrl = opts.avatarUrl ?? DEFAULT_AVATAR;

        const w0 = container.clientWidth  || 1;
        const h0 = container.clientHeight || 1;

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(opts.fov ?? 22, w0 / h0, 0.1, 100);
        camera.position.set(opts.camX ?? 0, opts.camY ?? 1.05, opts.camZ ?? 3.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w0, h0);
        renderer.outputColorSpace  = THREE.SRGBColorSpace;
        renderer.toneMapping       = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = opts.exposure ?? 1.05;
        container.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xeef5f8, 0x0a1820, 0.55));
        const key = new THREE.DirectionalLight(0xfff2e0, 1.25);
        key.position.set(2.5, 4, 3); scene.add(key);
        const rim = new THREE.DirectionalLight(0x7ad0c2, 0.65);
        rim.position.set(-3, 2.5, -2); scene.add(rim);
        const fil = new THREE.DirectionalLight(0xa8c0ce, 0.35);
        fil.position.set(-2, 1.5, 3.5); scene.add(fil);

        // Mutable bindings — all closures read these by reference, never by value
        let avatarGroup:   THREE.Group | null          = null;
        let mixer:         THREE.AnimationMixer | null = null;
        let currentAction: THREE.AnimationAction | null = null;
        let currentClipUrl = '';
        let cycleTimer: ReturnType<typeof setInterval> | null = null;

        // Queue-of-1: only one clip load in-flight; latest request always wins
        let clipLoading = false;
        let pendingClip: string | null = null;

        function playClipOnMixer(clip: THREE.AnimationClip) {
          if (!mixer) return;
          const action = mixer.clipAction(clip);
          action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
          if (currentAction && currentAction !== action) action.crossFadeFrom(currentAction, 0.75, true);
          currentAction = action;
        }

        async function mountAvatar(url: string) {
          const gltf     = await loadGLTF(url);
          if (cancelled) return;
          const newGroup = SkeletonUtils.clone(gltf.scene) as THREE.Group;

          const bbox = new THREE.Box3().setFromObject(newGroup);
          newGroup.position.y -= bbox.min.y;
          const size = bbox.getSize(new THREE.Vector3());
          camera.lookAt(0, size.y * (opts.lookAtRel ?? 0.62), 0);

          // Synchronous swap — happens between frames, no visual tear
          if (avatarGroup) { scene.remove(avatarGroup); disposeObject(avatarGroup); }
          if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(mixer.getRoot()); }
          avatarGroup   = newGroup;
          mixer         = new THREE.AnimationMixer(avatarGroup);
          currentAction = null;
          scene.add(avatarGroup);

          // Re-apply the last successfully played clip on the new skeleton
          if (currentClipUrl) {
            const clip = await loadFBXClip(currentClipUrl);
            if (!cancelled && clip) playClipOnMixer(clip);
          }
        }

        async function processPlayClip(url: string) {
          // Cancel any pending auto-transition (greet → idle) so it can't interrupt
          if (cycleTimer) { clearTimeout(cycleTimer); cycleTimer = null; }
          clipLoading = true;
          try {
            const clip = await loadFBXClip(url);
            if (cancelled) return;
            if (clip) { currentClipUrl = url; playClipOnMixer(clip); }
          } catch (e) {
            console.warn('[useThreeScene] clip load failed:', e);
          } finally {
            clipLoading = false;
            if (pendingClip !== null) {
              const next = pendingClip; pendingClip = null;
              processPlayClip(next);
            }
          }
        }

        // Load avatar GLB first
        await mountAvatar(avatarUrl);
        if (cancelled) return;

        // Expose imperative API immediately after avatar is ready
        apiRef.current = {
          playClip: (url) => {
            if (clipLoading) { pendingClip = url; return; }
            processPlayClip(url);
          },
        };

        // Drag-to-rotate
        let dragging    = false;
        let lastX       = 0;
        let targetRotY  = opts.startRotY ?? 0;
        let currentRotY = opts.startRotY ?? 0;
        let lastInteract = performance.now();
        const interactive = opts.interactive !== false;

        const onPointerDown = (e: PointerEvent) => {
          dragging = true; lastX = e.clientX;
          renderer.domElement.style.cursor = 'grabbing';
          lastInteract = performance.now();
          e.preventDefault();
        };
        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return;
          targetRotY += (e.clientX - lastX) * 0.012;
          lastX = e.clientX; lastInteract = performance.now();
        };
        const onPointerUp = () => { dragging = false; renderer.domElement.style.cursor = 'grab'; };

        if (interactive) {
          renderer.domElement.style.cursor = 'grab';
          renderer.domElement.style.touchAction = 'pan-y';
          renderer.domElement.addEventListener('pointerdown', onPointerDown);
          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
        }

        const clock = new THREE.Clock();
        let raf: number;

        function tick() {
          const dt = clock.getDelta();
          mixer?.update(dt);
          const idleMs = performance.now() - lastInteract;
          if (opts.autoRotate !== false && idleMs > (opts.autoRotateDelay ?? 3500)) {
            targetRotY += dt * (opts.autoRotateSpeed ?? 0.18);
          }
          currentRotY += (targetRotY - currentRotY) * 0.1;
          if (avatarGroup) avatarGroup.rotation.y = currentRotY;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        }

        // Start rendering immediately — avatar appears without waiting for FBX clips
        tick();

        const ro = new ResizeObserver(() => {
          const w = container.clientWidth, h = container.clientHeight;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        });
        ro.observe(container);

        cleanup = () => {
          cancelAnimationFrame(raf);
          if (cycleTimer) clearTimeout(cycleTimer);
          ro.disconnect();
          apiRef.current = null;
          if (interactive) {
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
          }
          if (avatarGroup) { scene.remove(avatarGroup); disposeObject(avatarGroup); }
          renderer.dispose();
          if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        };

        // Load initial animation clips after the first frame is already rendering.
        // This decouples avatar LCP from FBX network time.
        const has3Stages = !!opts.initialClips?.[2];
        const [clip0, clip1, clip2] = await Promise.all([
          loadFBXClip(opts.initialClips?.[0] ?? DEFAULT_GREET_URL),
          loadFBXClip(opts.initialClips?.[1] ?? DEFAULT_IDLE_URL),
          has3Stages ? loadFBXClip(opts.initialClips![2]) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        // Stage 1 — play immediately
        if (clip0) {
          currentClipUrl = opts.initialClips?.[0] ?? DEFAULT_GREET_URL;
          playClipOnMixer(clip0);
        }

        // Stage 2 — after cyclesMs
        cycleTimer = setTimeout(() => {
          if (cancelled) return;
          const stage2Clip = has3Stages ? clip1 : (clip1 ?? null);
          const stage2Url  = has3Stages
            ? opts.initialClips![1]
            : (opts.initialClips?.[1] ?? DEFAULT_IDLE_URL);
          if (stage2Clip) { currentClipUrl = stage2Url; playClipOnMixer(stage2Clip); }

          // Stage 3 — after cycles2Ms (only when 3 clips provided)
          if (has3Stages) {
            cycleTimer = setTimeout(() => {
              if (cancelled || !clip2) return;
              currentClipUrl = opts.initialClips![2];
              playClipOnMixer(clip2);
            }, opts.cycles2Ms ?? DEFAULT_GREET_DURATION) as unknown as ReturnType<typeof setInterval>;
          }
        }, opts.cyclesMs ?? DEFAULT_GREET_DURATION) as unknown as ReturnType<typeof setInterval>;
      } catch (err) {
        if (!cancelled) console.error('[useThreeScene] mount failed:', err);
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, apiRef };
}
