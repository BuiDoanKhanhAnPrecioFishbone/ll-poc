import { useEffect, useMemo, useState } from 'react';
import { generateParts, PART_COLUMNS, type Part } from '../data/parts';
import { DataGrid } from '../ui/DataGrid';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { BomComparisonDialog } from '../components/quotation/BomComparisonDialog';
import { PartBomDialog } from '../components/PartBomDialog';

/**
 * Bill of Materials list — Inventory Management » Bill of Materials.
 *
 * The guideline's entry for this screen is three steps: navigate to it, search
 * by description or part number, and a BoM Comparison button that follows "the
 * same behavior as defined in here" — so it opens the dialog the RFQ record
 * already uses rather than a second copy of it.
 *
 * WHICH PARTS APPEAR IS AN INFERENCE, and flagged as one. The sheet says "Show
 * the list of all parts", which reads like the Part Master line it was copied
 * from. Two things argue against taking it literally: the section's own context
 * paragraph says BoM "manages the product structure for each ASSEMBLY", and the
 * sheet elsewhere gates the BoM button on a part being MAKE or MAKE/PHAN. A Bill
 * of Materials list including the BUY components that sit INSIDE those BoMs
 * would contradict a rule the same document sets.
 *
 * So this lists parts that have a BoM. If the customer means every part, it is a
 * one-line change — recorded in the assessment so it is asked rather than
 * assumed.
 *
 * `Upload BoM` is on this screen because the sheet puts it here ("Navigate to
 * Inventory Management >> Bill of Materials >> Click on the Upload BoM button"),
 * but the four-step Create BoM form behind it is a package of its own and is not
 * built, so the button says what it would do.
 */
export function BomList() {
  const toast = useToast();
  const [compareOpen, setCompareOpen] = useState(false);
  const [selected, setSelected] = useState<Part | null>(null);

  /* Same seed as Part Master, so a part shows the same data on both screens. */
  const assemblies = useMemo(
    () => generateParts(2000).filter(p => p.partSource === 'MAKE'), []);

  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  return (
    <>
      <DataGrid
        data={assemblies}
        columns={PART_COLUMNS}
        title="Bill of Materials"
        subtitle="assemblies"
        /* The two fields the sheet names, in its order. */
        searchPlaceholder="Search part number or description"
        actions={<>
          <Button onClick={() => setCompareOpen(true)}>BoM Comparison</Button>
          <Button variant="filled"
                  onClick={() => toast.notImplemented('open the Create BoM form at Step 1 - Config BoM')}>
            Upload BoM
          </Button>
        </>}
        loading={loading}
        emptyHint="No assembly matches. Only parts that have a BoM appear on this screen."
        onOpenRow={setSelected}
      />

      {compareOpen && <BomComparisonDialog onClose={() => setCompareOpen(false)} />}
      {/* Opening a row goes straight to that assembly's BoM, which is the thing
          this screen is a list of — the part record would be a step sideways. */}
      {selected && <PartBomDialog part={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
