import { Icons } from '../common/Icons';

export function LeftRail() {
  return (
    <div className="rail" aria-hidden="false">
      <div className="brand">DEEPAK · SINGH · 2026</div>
      <div className="socials">
        <a href="https://linkedin.com/in/deepaksiingh" target="_blank" rel="noopener" title="LinkedIn">{Icons.linkedin}</a>
        <a href="#" title="GitHub">{Icons.github}</a>
        <a href="tel:+918840366263" title="Phone">{Icons.phone}</a>
        <a href="mailto:deepaksiingh20@gmail.com" title="Email">{Icons.mail}</a>
      </div>
    </div>
  );
}
