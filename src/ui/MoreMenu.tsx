import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Icon } from './icons';

export type MoreItem = {
  label: string;
  onSelect: () => void;
  /** Reads as a warning and sits apart from the rest. */
  danger?: boolean;
  disabled?: boolean;
  /** Why it is disabled, or what it will do. */
  title?: string;
  /** Shown under the label — the sentence a rare action needs and a frequent one does not. */
  note?: ReactNode;
};

/**
 * The overflow menu on a record's action bar.
 *
 * ASKED FOR, 8 October 2026 design review, slide 3: "Some 'danger' or less use
 * actions such as Deactivate, Cancel, Reprint … should be kept under a More
 * button", and "always place 'unexpected' action button at the end of the
 * button's list (not from 1st place)".
 *
 * It is the customer's answer to a problem this project had already measured
 * from the other side: Cancel RFQ sat 69px from Run Quotation, and Nielsen
 * Norman's work on consequential options next to benign ones says that is where
 * accidental clicks come from. Moving those actions behind one more press is a
 * stronger version of the same fix than the spacing we chose in September.
 *
 * WHAT GOES IN IT, and what does not. Rare or heavy actions, which on an RFQ
 * means Confirm RFQ and Cancel RFQ. The frequent ones — Run Quotation, Edit,
 * BoM Comparison — stay on the bar, because a menu is a second press and the
 * work of the day should not cost one.
 */
export function MoreMenu({ items, label = 'More' }: { items: MoreItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const usable = items.filter(Boolean);
  if (!usable.length) return null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {/* Kendo's own button classes, so it is the same object as the buttons
            beside it — a menu trigger that looks like a different species is
            how a user learns to skip it. */}
        <button type="button" className="k-button k-button-md k-button-outline k-button-base k-rounded-md vy-more-btn"
                aria-label={`${label} actions`}>
          <span>{label}</span>
          <Icon name="chevron-down" size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="vy-popover vy-more-menu" align="start" sideOffset={6}>
          <ul>
            {usable.map(i => (
              <li key={i.label}>
                <button type="button" data-danger={i.danger || undefined}
                        disabled={i.disabled} title={i.title}
                        onClick={() => { setOpen(false); i.onSelect(); }}>
                  <span>{i.label}</span>
                  {i.note && <span className="vy-more-note">{i.note}</span>}
                </button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
