interface Props { title: string; }

export function TerminalHead({ title }: Props) {
  return (
    <div className="terminal-head">
      <div className="dots"><i></i><i></i><i></i></div>
      <div className="term-title">{title}</div>
    </div>
  );
}
