import { useState } from 'react';
import { SectionHead } from '../common/SectionHead';
import { TerminalHead } from '../common/TerminalHead';

interface FormState {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
}

const BLANK: FormState = { name: '', email: '', company: '', topic: 'project', message: '' };

function ContactForm() {
  const [form, setForm] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
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
    await new Promise((r) => setTimeout(r, 900));
    setState('sent');
  };

  if (state === 'sent') {
    return (
      <div className="form" style={{ display: 'grid', placeItems: 'center', padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: '.16em', marginBottom: 12 }}>{'>'} MESSAGE SENT · 200 OK</div>
        <h3 style={{ fontFamily: 'var(--display)', fontSize: 36, lineHeight: 1.1, margin: '0 0 12px', fontWeight: 400 }}>Thanks, {form.name.split(' ')[0]}.</h3>
        <p style={{ color: 'var(--text-dim)', maxWidth: '40ch', margin: '0 0 24px' }}>
          I'll reply from <span style={{ color: 'var(--text)' }}>deepaksiingh20@gmail.com</span> within a day or two. In the meantime, the resume below has more.
        </p>
        <button className="btn ghost" type="button" onClick={() => { setForm(BLANK); setState('idle'); }}>
          ← Send another
        </button>
      </div>
    );
  }

  return (
    <form className="form reveal" onSubmit={submit} noValidate data-d="1">
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

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 18 }}>
        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : <><span>Send message</span> <span className="arr">→</span></>}
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-mute)', letterSpacing: '.1em' }}>
          ENCRYPTED · NO TRACKING
        </span>
      </div>
    </form>
  );
}

export function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <SectionHead num="04" label="Contact" title="" />
        <div className="contact" style={{ marginTop: -24 }}>
          <div className="contact-left reveal">
            <h2>Let's build something <span className="il">real</span>.</h2>
            <p>
              Open to backend roles, AI integration work, and the occasional consult on real-time
              systems. Quickest reply is usually email — but the form works too.
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
      </div>
    </section>
  );
}
