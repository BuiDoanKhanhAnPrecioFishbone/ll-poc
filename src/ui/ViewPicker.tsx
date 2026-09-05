import { Select } from './Overlays';
import type { SavedView } from './views';

/**
 * The saved-view chooser that sits in a grid's toolbar.
 *
 * TWO REASONS THIS EXISTS AS A COMPONENT. It was the same fifteen lines of JSX
 * copied into Part Master and Project Requirements, and it was the last plain
 * `<select>` on either screen — sitting a few centimetres from the Kendo
 * ComboBoxes in the filter row beneath it, in a different design. That is the
 * inconsistency phase F was for, left behind because phase F looked at form
 * fields and this one lives in a toolbar.
 *
 * KEYED BY ID, NOT BY NAME, which is why `Select` had to learn about
 * `{ value, label }` pairs. A view is chosen by `id` and shown by `name`; names
 * are typed by the user and `useViews` enforces no uniqueness, so two views may
 * both read "My view". Keying on the label would leave one of them unreachable —
 * a bug the `<select value={v.id}>` this replaces did not have. A migration that
 * makes the control prettier and quietly less correct is not worth doing.
 */
export function ViewPicker({ views, activeId, onChange }: {
  views: readonly SavedView[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="vy-view-picker">
      <Select
        label="Select View"
        value={activeId}
        onChange={onChange}
        options={views.map(v => ({
          value: v.id,
          /* "(default)" is part of the label rather than a separate badge: the
             list is a native popup of plain rows, and the fact matters most at
             the moment of choosing. */
          label: `${v.name}${v.isDefault ? ' (default)' : ''}`,
        }))}
      />
    </div>
  );
}
