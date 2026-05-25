/** Pure-CSS architecture diagram for the Insurance Extraction Platform */

function Node({ label, sub, type = 'stage' }: {
  label: string;
  sub?:  string;
  type?: 'input' | 'stage' | 'accent' | 'side' | 'output' | 'sink';
}) {
  return (
    <div className={`arch-node arch-node--${type}`}>
      <span className="arch-node-label">{label}</span>
      {sub && <span className="arch-node-sub">{sub}</span>}
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="arch-arrow-down">
      <div className="arch-arrow-track">
        <div className="arch-arrow-pulse" />
      </div>
      <div className="arch-arrow-head" />
    </div>
  );
}

function ArrowRight() {
  return <div className="arch-arrow-right">↔</div>;
}

export function ArchDiagram() {
  return (
    <div className="arch-diagram">

      {/* ── Row 1: Input formats ── */}
      <div className="arch-row">
        <Node label="PDF"   type="input" />
        <Node label="Excel" type="input" />
        <Node label="DOC"   type="input" />
      </div>

      <ArrowDown />

      {/* ── Row 2: Conversion ── */}
      <div className="arch-row arch-row--center">
        <Node label="Conversion Layer" sub="format normalisation" type="stage" />
      </div>

      <ArrowDown />

      {/* ── Row 3: Classification + Vector Search ── */}
      <div className="arch-row arch-row--split">
        <Node label="Classification"  sub="document type" type="stage" />
        <ArrowRight />
        <Node label="Vector Search"   sub="retrieval index" type="side" />
      </div>

      <ArrowDown />

      {/* ── Row 4: LLM Extraction + Provider Layer ── */}
      <div className="arch-row arch-row--split">
        <Node label="LLM Extraction"  sub="prompt-driven" type="accent" />
        <ArrowRight />
        <Node label="Provider Layer"  sub="sync · async · concurrency" type="side" />
      </div>

      <ArrowDown />

      {/* ── Row 5: Post-processing ── */}
      <div className="arch-row arch-row--center">
        <Node label="Post-processing" sub="validation · normalisation" type="stage" />
      </div>

      <ArrowDown />

      {/* ── Row 6: Output ── */}
      <div className="arch-row arch-row--split arch-row--output">
        <Node label="Structured JSON" type="output" />
        <div className="arch-arrow-right arch-arrow-right--solid">→</div>
        <Node label="Downstream Systems" sub="APIs · warehouses · apps" type="sink" />
      </div>

      {/* ── Infra footer ── */}
      <div className="arch-infra">
        <span className="arch-infra-pill">🐳 Docker</span>
        <span className="arch-infra-pill">☁ AWS</span>
        <span className="arch-infra-pill">⚙ FastAPI</span>
      </div>

    </div>
  );
}
