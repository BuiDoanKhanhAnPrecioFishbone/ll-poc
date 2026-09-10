import { useMemo, useState } from 'react';
import { DataGrid } from '../ui/DataGrid';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { generatePackingLists, PACKING_LIST_COLUMNS } from '../data/engineering';

/**
 * Packing Lists — `/inventory-management/packing-list`. Gap M6.
 *
 * New to Inventory Management since our 25 Aug capture, and new to us entirely.
 *
 * The one behaviour the bundle establishes is the shipment confirmation:
 * `Packing_List.Confirm_Ship_Title`, `Packing_List.Ship_Confirm`, and the
 * message "Mark this packing list as SHIPPED? This stamps the ship date and
 * updates shipped quantities." So SHIPPED is a real state, reached through a
 * confirmation, and it writes two things rather than one. `Create packing list`
 * and `New packing list` are also literals in the shipped code, which is why
 * the primary action is worded the way it is.
 *
 * FULFILLMENT and BILLING are the live column names; only SHIPPED is a value we
 * have actually seen. The rest of both vocabularies is inferred and flagged.
 */
export function PackingList() {
  const toast = useToast();
  const data = useMemo(() => generatePackingLists(), []);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  return (
    <DataGrid
      title="Packing Lists"
      subtitle="What is going out of the door, and what has been billed for"
      data={data}
      columns={PACKING_LIST_COLUMNS}
      searchPlaceholder="Search packing list, sales order or customer"
      selected={selected}
      onSelectedChange={setSelected}
      actions={
        <Button variant="filled" onClick={() => toast.notImplemented('create a packing list')}>
          Create packing list
        </Button>
      }
      onOpenRow={p => toast.notImplemented(`open ${p.packingList}`)}
    />
  );
}
