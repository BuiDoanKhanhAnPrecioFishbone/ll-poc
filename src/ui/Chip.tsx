/**
 * Filter chip. MD3 calls this an "input chip": selected state is a tonal fill
 * plus a leading check, never colour alone — so it survives greyscale and
 * colour-blindness.
 */
export function Chip({ label, selected, onClick }: {
  label: string; selected?: boolean; onClick?: () => void;
}) {
  return (
    <button type="button" className="vy-chip" data-selected={selected || undefined}
            data-state-layer aria-pressed={selected} onClick={onClick}>
      {selected && (
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden className="vy-chip-check">
          <path d="M3 8.5 6.2 11.5 13 4.5" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}
