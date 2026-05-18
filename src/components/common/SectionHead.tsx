interface Props {
  num: string;
  label: string;
  title: string;
  extra?: React.ReactNode;
}

export function SectionHead({ num, label, title, extra }: Props) {
  return (
    <div className="section-head reveal">
      <div>
        <div className="section-num">{num} · {label}</div>
        <h2 className="section-title">{title}</h2>
      </div>
      {extra}
    </div>
  );
}
