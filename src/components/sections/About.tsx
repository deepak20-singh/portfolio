import { SectionHead } from '../common/SectionHead';
import { TerminalHead } from '../common/TerminalHead';

export function About() {
  return (
    <section id="about">
      <div className="container">
        <SectionHead num="01" label="About" title="About me" />

        <div className="about-grid">
          <div className="reveal">
            <div className="about-photo">
              <img
                src="/uploads/profile.png"
                alt="Profile"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
              />
            </div>
          </div>

          <div className="about-card reveal" data-d="1">
            <TerminalHead title="~/deepak/about.md" />
            <h3>I write backend services that disappear into the product — fast, quiet, and impossible to break.</h3>
            <p>
              <span className="prompt">-</span>
              For <span className="highlight">3+ years</span> building high-concurrency Python services (FastAPI/Flask) at <span className="highlight">Openstream.ai</span>, maintaining sub-200ms response times.
            </p>

            <p>
              <span className="prompt">-</span>
              Lately, my work focuses on bridging traditional backends with LLMs—architecting RAG pipelines, prompt engineering, structured validation, and the low-latency inference plumbing driving a <span className="highlight">3D conversational</span> avatar over <span className="highlight">WebRTC</span>.
            </p>

            <p>
              <span className="prompt">-</span>
              I care about the boring fundamentals — clean architecture, code reviews, SLOs that hold — because that's what lets the interesting parts ship.
            </p>

            <div className="meta-row">
              <div>
                <div className="k">Based in</div>
                <div className="v">Bengaluru, IN</div>
              </div>
              <div>
                <div className="k">Education</div>
                <div className="v">B.Tech + M.Tech AI</div>
              </div>
              <div>
                <div className="k">Currently</div>
                <div className="v">Building avatars</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
