/* =============================================================================
   THE BILL OF MATERIALS LIST
   -----------------------------------------------------------------------------
   Gap M3. This screen used to render `PART_COLUMNS` — it listed PARTS that
   happen to have a BoM, because the Testing Guideline's entry for it reads
   "Show the list of all parts", which `BomList.tsx` flagged in its own header
   as a line probably copied from the Part Master section above it.

   THE LIVE SYSTEM ANSWERS THAT OPEN QUESTION. `/engineering/bom`, read 10 Sep,
   is a list of BILLS OF MATERIALS:

     ASSEMBLY PN · REVISION · DESCRIPTION · BOM VERSION · CUSTOMER ·
     LAST RUN BY · LAST RUN DATE · BOM STATUS

   BOM VERSION, LAST RUN BY and LAST RUN DATE are not properties a part has.
   An assembly with three BoM versions is three rows there and was one row here.

   Rows are built from `bomFor(part)`, the same generator the part record's BoM
   tab uses, so an assembly reports the same version and the same runner on the
   list and inside the record. Two screens disagreeing about one assembly is the
   defect this project keeps finding in the live system; it would be worse to
   ship it in the thing meant to fix it.
   ========================================================================== */
import type { ColumnSpec } from '../components/column-model';
import type { ViewField } from '../ui/views';
import { bomFor } from './partBom';
import { BOM_SOURCES } from './partMetadata';
import { generateParts, type Part } from './parts';

export type BomRow = {
  id: string;
  assemblyPn: string;
  revision: string;
  description: string;
  bomVersion: string;
  customer: string;
  lastRunBy: string;
  lastRunDate: Date;
  bomStatus: string;
  /** Kept so a row can still open the part record behind the assembly. */
  part: Part;
};

export function generateBomList(): BomRow[] {
  return generateParts(2000)
    .filter(p => BOM_SOURCES.includes(p.partSource))
    .map(p => {
      const b = bomFor(p);
      return {
        id: `${p.partNumber}@${b.version}`,
        assemblyPn: p.partNumber,
        revision: p.rev,
        description: p.description,
        /* Live renders a version, not a bare integer — `bomFor` counts from 1
           and the live column reads like a label, so it is formatted here
           rather than left as a number that would right-align under a heading
           called BOM VERSION. */
        bomVersion: `v${b.version}`,
        customer: p.customer,
        lastRunBy: b.runBy,
        lastRunDate: b.lastUpdated,
        /* ACTIVE / INACTIVE, and this one is evidenced rather than guessed: the
           audit log carries `ToggleStatusBOM` / `Toggle Status BOM`, so BoM
           status is a two-state toggle. Which two words the live system shows
           was not observed — flagged in the gap list. */
        bomStatus: b.version > 1 || p.status === 'Active' ? 'Active' : 'Inactive',
        part: p,
      };
    });
}

export const BOM_LIST_COLUMNS: ColumnSpec<BomRow>[] = [
  { field: 'assemblyPn',  title: 'Assembly PN',   role: 'ident', searchable: true },
  { field: 'revision',    title: 'Revision',      role: 'code' },
  { field: 'description', title: 'Description',   role: 'text', searchable: true },
  { field: 'bomVersion',  title: 'BoM Version',   role: 'code' },
  { field: 'customer',    title: 'Customer',      role: 'text', searchable: true },
  { field: 'lastRunBy',   title: 'Last Run By',   role: 'text' },
  /* A moment, like Part Master's LAST CHANGE — a BoM run is an event. */
  { field: 'lastRunDate', title: 'Last Run Date', role: 'datetime' },
  { field: 'bomStatus',   title: 'BoM Status',    role: 'status' },
];

/* The KPI row the 25 Aug review asked for ("the KPI can also be the filter",
   gap C3/D12) — now counting BoMs by their own status rather than by the part
   status it was borrowing, which on a list of assemblies said the same thing
   about every row. */
export const BOM_QUICK: { key: string; label: string; match: (b: BomRow) => boolean }[] = [
  { key: 'active',   label: 'Active',   match: b => b.bomStatus === 'Active' },
  { key: 'inactive', label: 'Inactive', match: b => b.bomStatus === 'Inactive' },
  /* Not a status — a question the other two cannot answer: which assemblies
     have been revised since their first BoM. It is the column this screen
     gained (BOM VERSION) turned into a filter. */
  { key: 'revised',  label: 'Revised',  match: b => b.bomVersion !== 'v1' },
];

/* The filter panel's fields. Deliberately the four that VARY on this screen:
   Part Source has one value here by definition, and the part-level fields the
   old version offered (Part Class, Part Type, UoM, ABC) describe a part, not
   its bill of materials. */
export function bomFilterFields(rows: BomRow[]): ViewField<BomRow>[] {
  const uniq = (xs: string[]) => [...new Set(xs)].filter(Boolean).sort();
  return [
    { field: 'customer', label: 'Customer', kind: 'select',
      options: uniq(rows.map(b => b.customer)), value: b => b.customer },
    { field: 'bomStatus', label: 'BoM Status', kind: 'select',
      options: uniq(rows.map(b => b.bomStatus)), value: b => b.bomStatus },
    { field: 'lastRunBy', label: 'Last Run By', kind: 'select',
      options: uniq(rows.map(b => b.lastRunBy)), value: b => b.lastRunBy },
    { field: 'lastRunDate', label: 'Last Run Date', kind: 'date-range',
      value: b => b.lastRunDate },
  ];
}
