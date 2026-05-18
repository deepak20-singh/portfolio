interface Props { active: string; }

const NAV_ITEMS = [
  { id: 'home',    label: 'Home' },
  { id: 'about',   label: 'About' },
  { id: 'skills',  label: 'Skills' },
  { id: 'work',    label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

export function TopNav({ active }: Props) {
  return (
    <nav className="top">
      {NAV_ITEMS.map((it) => (
        <a key={it.id} href={`#${it.id}`} className={active === it.id ? 'active' : ''}>
          {it.label}
        </a>
      ))}
    </nav>
  );
}
