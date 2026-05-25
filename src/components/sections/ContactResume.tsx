import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { SectionHead }  from '../common/SectionHead';
import { TerminalHead } from '../common/TerminalHead';
import type { AvatarViewerHandle } from '../media/AvatarViewer';

const AvatarViewer = lazy(() =>
  import('../media/AvatarViewer').then(m => ({ default: m.AvatarViewer }))
);

// ── Contact form ──────────────────────────────────────────────────────────────
interface FormState { name: string; email: string; company: string; topic: string; message: string; }
const BLANK: FormState = { name: '', email: '', company: '', topic: 'project', message: '' };

function ContactForm() {
  const [form,   setForm]   = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [state,  setState]  = useState<'idle' | 'sending' | 'sent'>('idle');

  const update = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f  => ({ ...f,  [k]: e.target.value }));
      setErrors(er => ({ ...er, [k]: undefined }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<FormState> = {};
    if (!form.name.trim()) er.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Looks off';
    if (form.message.trim().length < 12) er.message = 'A few words more, please';
    setErrors(er);
    if (Object.keys(er).length) return;

    setState('sending');
    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '241df8ff-a972-442a-b1cc-d86e6411e5b6',
          subject:   `New message from ${form.name} — ${form.topic}`,
          from_name:  form.name,
          replyto:    form.email,
          'Full Name': form.name,
          'Email':     form.email,
          'Company':   form.company || '—',
          'Topic':     form.topic,
          'Message':   form.message,
        }),
      });
      const data = await res.json();
      setState(data.success ? 'sent' : 'idle');
    } catch { setState('idle'); }
  };

  if (state === 'sent') {
    return (
      <div className="form cr-form-sent">
        <div className="cr-sent-label">{'>'} MESSAGE SENT · 200 OK</div>
        <h3>Thanks, {form.name.split(' ')[0]}.</h3>
        <p>I'll reply within a day or two. The résumé on the right has more about my background.</p>
        <button className="btn ghost" type="button" onClick={() => { setForm(BLANK); setState('idle'); }}>
          ← Send another
        </button>
      </div>
    );
  }

  return (
    <form className="form reveal" onSubmit={submit} noValidate data-d="2">
      <TerminalHead title="POST /api/v1/contact" />

      <div className="form-row">
        <div className="field">
          <label>Name <span className="req">*</span></label>
          <input type="text" value={form.name} onChange={update('name')} placeholder="Ada Lovelace" />
          {errors.name && <span className="err">{errors.name}</span>}
        </div>
        <div className="field">
          <label>Email <span className="req">*</span></label>
          <input type="email" value={form.email} onChange={update('email')} placeholder="ada@example.com" />
          {errors.email && <span className="err">{errors.email}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Company <span style={{ opacity: .5 }}>optional</span></label>
          <input type="text" value={form.company} onChange={update('company')} placeholder="Where you build" />
        </div>
        <div className="field">
          <label>Topic</label>
          <select value={form.topic} onChange={update('topic')}>
            <option value="project">New project / collaboration</option>
            <option value="role">Full-time role</option>
            <option value="contract">Contract work</option>
            <option value="chat">Just to chat</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>
          <span>Message <span className="req">*</span></span>
          <span className="hint">{form.message.length} / 1000</span>
        </label>
        <textarea rows={5} value={form.message} maxLength={1000} onChange={update('message')}
          placeholder="What are you building? What's the stack? When do you need it?" />
        {errors.message && <span className="err">{errors.message}</span>}
      </div>

      <div className="cr-form-footer">
        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : <><span>Send message</span><span className="arr">→</span></>}
        </button>
        <span className="cr-form-note">ENCRYPTED · NO TRACKING</span>
      </div>
    </form>
  );
}

// ── Combined section ──────────────────────────────────────────────────────────
export function ContactResume() {
  const sectionRef                   = useRef<HTMLElement>(null);
  const viewerRef                    = useRef<AvatarViewerHandle>(null);
  const [avatarMounted, setMounted]  = useState(false);

  // Mount avatar when section scrolls near viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMounted(true); io.disconnect(); } },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="contact">
      <div className="container">
        <SectionHead num="04" label="Contact & Résumé" title="" />

        <div className="cr-grid">

          {/* ── Left 60% — contact ── */}
          <div className="cr-left">
            <div className="cr-intro reveal" data-d="1">
              <h2 className="cr-heading">Let's build something <span className="il">real</span>.</h2>
              <p className="cr-sub">
                Open to backend roles, AI integration work, and the occasional consult on
                real-time systems. Quickest reply is usually email — but the form works too.
              </p>
              <div className="contact-quick">
                <a href="mailto:deepaksiingh20@gmail.com">
                  <span>{'>'} deepaksiingh20@gmail.com</span>
                  <span className="arr">↗</span>
                </a>
                <a href="https://linkedin.com/in/deepaksiingh" target="_blank" rel="noopener">
                  <span>{'>'} linkedin.com/in/deepaksiingh</span>
                  <span className="arr">↗</span>
                </a>
                <a href="tel:+918840366263">
                  <span>{'>'} +91 88403 66263</span>
                  <span className="arr">↗</span>
                </a>
              </div>
            </div>

            <ContactForm />
          </div>

          {/* ── Right 60% — avatar, full height, floating buttons ── */}
          <div className="cr-right reveal" data-d="3">
            <div className="cr-avatar-wrap">
              {avatarMounted
                ? <Suspense fallback={<div className="cr-avatar-placeholder" />}>
                    <AvatarViewer
                      ref={viewerRef}
                      fov={28} camY={0.95} camZ={4.9} lookAtRel={0.55}
                      avatarUrl="/uploads/first_avatar.glb"
                      interactive={true} autoRotate={false} startRotY={0}
                    />
                  </Suspense>
                : <div className="cr-avatar-placeholder" />
              }

              {/* Floating circular resume buttons — bottom-right */}
              <div className="cr-fabs">
                <a
                  className="cr-fab cr-fab--download"
                  href="/uploads/Python_Dev.pdf"
                  download="Deepak_Singh_Resume.pdf"
                  aria-label="Download résumé"
                >
                  <span className="cr-fab-icon">
                    {/* download arrow */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </span>
                  <span className="cr-fab-label">Download</span>
                </a>

                <a
                  className="cr-fab cr-fab--read"
                  href="/uploads/Python_Dev.pdf"
                  target="_blank"
                  rel="noopener"
                  aria-label="Read résumé online"
                >
                  <span className="cr-fab-icon">
                    {/* external link */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </span>
                  <span className="cr-fab-label">Read online</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
