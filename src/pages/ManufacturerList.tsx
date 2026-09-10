import { useMemo, useState } from 'react';
import { DataGrid } from '../ui/DataGrid';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { generateManufacturers, MANUFACTURER_COLUMNS } from '../data/engineering';

/**
 * Manufacturers (MFG) — `/engineering/mfg`. Gap M4.
 *
 * A screen the live system has had all along and this prototype did not. It sat
 * under Procurement Management in our 25 Aug capture as "Manufacturer
 * Management"; the customer moved it into the new Engineering group and renamed
 * it, and either way we only ever had a nav entry pointing at a placeholder.
 *
 * DELIBERATELY PLAIN. Six columns and three actions, because six columns and
 * three actions is what the live screen has. No KPI tiles, no saved views, no
 * filter panel: those exist on Part Master and Project Requirements because the
 * 25 Aug review and the Testing Guideline asked for them THERE. Nothing has
 * asked for them here, and adding them because the other screens have them is
 * how a prototype grows features the customer never requested.
 */
export function ManufacturerList() {
  const toast = useToast();
  const data = useMemo(() => generateManufacturers(), []);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  return (
    <DataGrid
      title="Manufacturer List"
      subtitle="Who makes a part, as distinct from who sells it to you"
      data={data}
      columns={MANUFACTURER_COLUMNS}
      searchPlaceholder="Search name, website or alias"
      selected={selected}
      onSelectedChange={setSelected}
      actions={<>
        <Button onClick={() => toast.notImplemented('import manufacturers')}>Import manufacturer</Button>
        <Button variant="filled" onClick={() => toast.notImplemented('add a manufacturer')}>
          Add manufacturer
        </Button>
      </>}
      /* The live grid has a per-row Edit. Opening from the identifier is this
         prototype's standing pattern and the reason is recorded in
         docs/table-patterns.md — it is open question 1, not a local decision. */
      onOpenRow={m => toast.notImplemented(`open ${m.name}`)}
    />
  );
}
