interface Props { children: React.ReactNode; }

export function Eyebrow({ children }: Props) {
  return <span className="eyebrow">{children}</span>;
}
