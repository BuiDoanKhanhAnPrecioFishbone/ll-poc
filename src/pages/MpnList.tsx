import { useMemo, useState } from 'react';
import { DataGrid } from '../ui/DataGrid';
import { useToast } from '../ui/Toast';
import { generateMpns, MPN_COLUMNS } from '../data/engineering';

/**
 * Part Numbers (MPN) — `/engineering/mpn`. Gap M5.
 *
 * The sidebar has pointed at this screen since the first build and it has
 * always reached `Placeholder`. The live system has a full list here, headed
 * "Manufacturer Part Number Management".
 *
 * Nine columns, read off the live grid. Two of them tell us something the rest
 * of this prototype does not model: `PCN ALERT` (an outstanding Product Change
 * Notice) and `LAST SYNCED AT` — together with the Manufacturers screen's
 * `LAST SYNC`, they say this data is kept in step with an external provider.
 * The bundle carries `/validate/z2data` and `/z2data` endpoints, and the audit
 * log distinguishes a quote run served from the Nexar cache from one that hit
 * the Nexar API. None of that is designed here; it is recorded so the next
 * person does not treat these as ordinary editable columns.
 *
 * LIFECYCLE STATUS values are the industry-standard set, NOT the customer's —
 * the live grid was read on a screen whose rows had not loaded. Flagged in the
 * gap list; confirm before anything depends on the exact words.
 */
export function MpnList() {
  const toast = useToast();
  const data = useMemo(() => generateMpns(), []);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  return (
    <DataGrid
      title="Manufacturer Part Number Management"
      subtitle="Approved manufacturer equivalents, kept in step with the provider"
      data={data}
      columns={MPN_COLUMNS}
      searchPlaceholder="Search MPN, manufacturer or description"
      selected={selected}
      onSelectedChange={setSelected}
      onOpenRow={m => toast.notImplemented(`open ${m.mpnNumber}`)}
    />
  );
}
