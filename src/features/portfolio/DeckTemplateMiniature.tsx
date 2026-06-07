import type { PortfolioDeckTemplateMeta } from "@/lib/types";

export function DeckTemplateMiniature({ template }: { template: PortfolioDeckTemplateMeta }) {
  return (
    <div
      className={`deck-miniature deck-miniature-${template.id}`}
      style={{
        "--mini-primary": template.palette.primary,
        "--mini-secondary": template.palette.secondary
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="deck-miniature-index">01</div>
      <div className="deck-miniature-image" />
      <div className="deck-miniature-copy">
        <span />
        <strong />
        <i />
        <i />
      </div>
    </div>
  );
}
