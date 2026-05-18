import { AvatarViewer } from '../media/AvatarViewer';

export function ResumeCTA() {
  return (
    <section id="resume" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="container">
        <div className="resume-cta reveal">
          <div>
            <div className="section-num" style={{ marginBottom: 10 }}>05 · Resume</div>
            <h3>Prefer the one-page version?</h3>
            <p>The full PDF — experience, projects, stack, and references — in the same format your ATS expects.</p>
            <div className="actions">
              <a className="btn" href="/uploads/Python_Dev.pdf" download="Deepak_Singh_Resume.pdf">
                Download résumé <span className="arr">↓</span>
              </a>
              <a className="btn ghost" href="/uploads/Python_Dev.pdf" target="_blank" rel="noopener">
                View in browser <span className="arr">→</span>
              </a>
            </div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', position: 'relative', minHeight: 280 }}>
            <AvatarViewer
              fov={20} camY={1.10} camZ={4.3} lookAtRel={0.62}
              avatarUrl="/uploads/first_avatar.glb"
              interactive={false} autoRotate={false} startRotY={0}
              style={{ width: 280, height: 360 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
