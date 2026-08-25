import { useState } from 'react';
import { Button } from './Button';
import { Chip } from './Chip';
import { Select } from './Overlays';
import { TextField } from './Field';
import { OPERATORS, describe, type Condition, type FilterField, type Operator, type QuickFilter } from './filters';

/**
 * Quick filters and advanced filters, as the 25 Aug review specifies them.
 *
 * They sit in one bar because they answer the same question at two levels of
 * effort, and splitting them across the screen would make the cheap one hard to
 * find. Quick filters lead: they are one click and cover most of the day.
 *
 * The advanced panel is DISCLOSED, not always open. A permanently visible
 * condition builder is the classic ERP filter mistake — it costs vertical space
 * on every visit to serve the minority of visits that need it, and pushes the
 * grid below the fold. Closed, its conditions stay visible as chips, so nothing
 * is filtering invisibly.
 */
export function FilterBar<T>({
  quick, activeQuick, onQuick,
  fields, conditions, onConditions,
  total, shown,
}: {
  quick: QuickFilter<T>[];
  activeQuick: string[];
  onQuick: (key: string) => void;
  fields: FilterField<T>[];
  conditions: Condition[];
  onConditions: (c: Condition[]) => void;
  total: number;
  shown: number;
}) {
  const [open, setOpen] = useState(false);
  const anyFilter = activeQuick.length > 0 || conditions.length > 0;

  const add = () => {
    const f = fields[0];
    onConditions([...conditions, {
      id: Date.now() + conditions.length,
      field: f.field, op: OPERATORS[f.type][0].op, value: '',
    }]);
  };
  const update = (id: number, patch: Partial<Condition>) =>
    onConditions(conditions.map(c => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: number) => onConditions(conditions.filter(c => c.id !== id));

  return (
    <div className="vy-filters">
      <div className="vy-filter-row-main">
        <span className="vy-filter-label">Show</span>

        {quick.map(f => (
          <Chip key={f.key} label={f.label}
                selected={activeQuick.includes(f.key)}
                onClick={() => onQuick(f.key)} />
        ))}

        <span className="vy-toolbar-spacer" />

        {/* The count belongs beside the controls that changed it, so cause and
            effect are read together. */}
        {anyFilter && (
          <span className="vy-filter-count">
            {shown.toLocaleString()} of {total.toLocaleString()}
          </span>
        )}

        <Button variant={open || conditions.length ? 'tonal' : 'text'}
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}>
          Advanced{conditions.length > 0 && ` (${conditions.length})`}
        </Button>

        {anyFilter && (
          <Button variant="text" onClick={() => { activeQuick.forEach(onQuick); onConditions([]); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Closed, the conditions still show. A filter you cannot see is a grid
          that looks wrong for no reason. */}
      {!open && conditions.length > 0 && (
        <div className="vy-filter-row-main vy-filter-summary">
          {conditions.map(c => (
            <Chip key={c.id} label={describe(c, fields)} selected
                  onClick={() => remove(c.id)} />
          ))}
        </div>
      )}

      {open && (
        <div className="vy-advanced">
          {conditions.length === 0 && (
            <p className="vy-hint">
              Add a condition to filter on any field of the record, not just the ones above.
            </p>
          )}

          {conditions.map(c => {
            const f = fields.find(x => x.field === c.field)!;
            const ops = OPERATORS[f.type];
            const needsValue = c.op !== 'empty' && c.op !== 'not_empty';
            return (
              <div className="vy-condition" key={c.id}>
                {/* Both selects carry LABELS as their value and map back on
                    change. The alternative is a `display` prop on Select purely
                    for this screen, which would make one shared control carry a
                    concept only one caller has. */}
                <Select label="Field" value={f.label}
                        options={fields.map(x => x.label)}
                        onChange={label => {
                          const nf = fields.find(x => x.label === label)!;
                          /* Changing the field can invalidate the operator, so
                             it resets to the first one that fits the new type
                             rather than leaving "contains" on a date. */
                          update(c.id, { field: nf.field, op: OPERATORS[nf.type][0].op, value: '', value2: '' });
                        }} />
                <Select label="Condition"
                        value={ops.find(o => o.op === c.op)?.label ?? ops[0].label}
                        options={ops.map(o => o.label)}
                        onChange={label => update(c.id, {
                          op: ops.find(o => o.label === label)!.op as Operator, value2: '',
                        })} />

                {needsValue && (
                  f.type === 'select' ? (
                    <Select label="Value" value={c.value}
                            options={['', ...(f.options ?? [])]}
                            onChange={v => update(c.id, { value: v })} />
                  ) : f.type === 'boolean' ? (
                    <Select label="Value" value={c.value} options={['', 'true', 'false']}
                            onChange={v => update(c.id, { value: v })} />
                  ) : (
                    <TextField
                      aria-label="Value"
                      type={f.type === 'date' && c.op !== 'last_days' ? 'date' : f.type === 'number' || c.op === 'last_days' ? 'number' : 'text'}
                      value={c.value}
                      onChange={e => update(c.id, { value: e.target.value })} />
                  )
                )}

                {c.op === 'between' && (
                  <TextField aria-label="Upper bound"
                             type={f.type === 'date' ? 'date' : 'number'}
                             value={c.value2 ?? ''}
                             onChange={e => update(c.id, { value2: e.target.value })} />
                )}

                <button type="button" className="vy-condition-remove"
                        aria-label={`Remove condition on ${f.label}`}
                        onClick={() => remove(c.id)}>
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
                       strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="m5 5 10 10M15 5 5 15" /></svg>
                </button>
              </div>
            );
          })}

          <div className="vy-advanced-actions">
            <Button size="sm" onClick={add}>Add condition</Button>
            {/* Stated, not assumed. Someone who adds three conditions and sees
                fewer rows than expected should be able to find out why without
                guessing at the operator between them. */}
            {conditions.length > 1 && (
              <span className="vy-hint">All conditions must match.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
