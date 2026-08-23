/**
 * Priority rating.
 *
 * Read-only stars. Written rather than imported because the library version
 * carried 4px of internal padding that forced a 36px row floor and made compact
 * density unreachable on Quotations — the whole of GAP-02. Ours inherits the
 * row height, so the 28px compact row works with a rating in it.
 */
export function Rating({ value, max = 3 }: { value: number; max?: number }) {
  return (
    <span className="vy-rating" role="img" aria-label={`Priority ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" width="14" height="14" aria-hidden
             className="vy-star" data-on={i < value || undefined}>
          <path d="M10 1.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L10 14.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85z"
                fill={i < value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3"
                strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}
