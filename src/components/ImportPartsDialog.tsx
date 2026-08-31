import { useMemo, useState } from 'react';
import { Dialog, RadioGroup, Select } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import type { Part } from '../data/parts';

/**
 * Import parts — the choice the guideline asks Import to offer.
 *
 * The whole of its specification is two lines:
 *
 *   Import All: Allows importing parts that can be used across the system.
 *   Import by Customer: Allows importing parts per specific customer.
 *
 * That is genuinely all. The sheet's later headings `*Import the new Part*` and
 * `*Export Part Master Data*` have no content beneath them at all, so there is
 * no file format, no column mapping, no validation, no duplicate rule and no
 * confirmation step to build from.
 *
 * SO THE SCOPE OF THIS DIALOG IS THE CHOICE, and it stops there. It would have
 * been easy to bolt on a plausible upload-map-preview-commit wizard; every step
 * of it would have been invented, and `docs/precedence.md` exists because
 * inventing where the live system or the sheet has an answer is how this project
 * went wrong before. What the sheet does specify — that these are two different
 * scopes, and what each one means — is worth building properly, because choosing
 * the wrong one imports parts into the wrong place.
 *
 * The consequence of each is spelled out under the option rather than left to
 * the label. "Import by Customer" does not say what happens to parts imported
 * that way; "only that customer's records can use them" does.
 */
export function ImportPartsDialog({ parts, onClose }: {
  parts: Part[];
  onClose: () => void;
}) {
  const toast = useToast();
  const [scope, setScope] = useState<'all' | 'customer'>('all');
  const [customer, setCustomer] = useState('');

  /* Read off the data, like every other picker here, so it cannot offer a
     customer that has no parts. */
  const customers = useMemo(
    () => [...new Set(parts.map(p => p.customer))].filter(Boolean).sort(),
    [parts]);

  /* "Import by Customer" without a customer is not a smaller import, it is an
     unanswerable one — so the action waits rather than guessing at "all". */
  const ready = scope === 'all' || customer !== '';

  return (
    <Dialog
      open
      size="md"
      onClose={onClose}
      title="Import parts"
      subtitle="Choose how far the imported parts should reach"
      actions={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="filled" disabled={!ready}
                title={ready ? undefined : 'Choose a customer first'}
                onClick={() => {
                  toast.notImplemented(scope === 'all'
                    ? 'import a parts file, available across the system'
                    : `import a parts file for ${customer} only`);
                  onClose();
                }}>
          Continue
        </Button>
      </>}
    >
      <div className="vy-import-scope">
        <RadioGroup
          label="Import scope"
          value={scope}
          onChange={v => setScope(v as 'all' | 'customer')}
          options={[
            { value: 'all', label: 'Import All' },
            { value: 'customer', label: 'Import by Customer' },
          ]}
        />

        <p className="vy-hint">
          {scope === 'all'
            ? 'Parts are available across the system — any customer’s BoM, quotation or order can use them.'
            : 'Parts belong to one customer. Only that customer’s records can use them, which is what consigned and customer-specific material needs.'}
        </p>

        {scope === 'customer' && (
          <label className="vy-field-control">
            <span className="vy-field-label">Customer</span>
            <Select
              label="Customer"
              value={customer}
              onChange={setCustomer}
              options={customers}
              required
            />
          </label>
        )}

        {/* Said plainly rather than implied by a dead file-picker. The sheet
            names no file format, column mapping, validation or duplicate rule,
            so none is drawn — a greyed "Choose file" would suggest the rest of
            the flow exists somewhere behind it. */}
        <div className="vy-empty-inline">
          <strong>The file step is not specified yet.</strong> The Testing Guideline defines
          these two options and nothing further — no format, column mapping, validation or
          duplicate rule — so none is built here. Continue reports what it would do.
        </div>
      </div>
    </Dialog>
  );
}
