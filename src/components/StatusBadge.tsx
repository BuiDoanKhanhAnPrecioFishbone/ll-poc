import { Badge } from '@progress/kendo-react-indicators';
import { STATUS_TOKEN, STATUS_THEME } from '../data/status';

/**
 * Stock Kendo `Badge`, coloured through the shared status vocabulary rather
 * than per-screen. The legacy app renders every Part Master status as the same
 * green pill, which makes the column decorative rather than informative.
 *
 * Width varies with the label — see GAP-01 in docs/gap-register.md.
 *
 * `position={null}` is required, and is the documented value for "inline with
 * the content of the container element". Every other value — including the
 * default, `'edge'` — makes the badge `position: absolute`, which parks it in
 * the corner of the nearest positioned ancestor rather than in the cell.
 */
export function StatusBadge({ value }: { value: string }) {
  const token = STATUS_TOKEN[value] ?? 'draft';
  return (
    <span className="vy-status-slot">
      <Badge themeColor={STATUS_THEME[token]} rounded="full" size="medium" position={null}>
        {value}
      </Badge>
    </span>
  );
}
