import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Dialog, RadioGroup, Checkbox, Select } from '../../ui/Overlays';
import { useToast } from '../../ui/Toast';

/**
 * BoM Comparison.
 *
 * Structure is the live one: three comparison modes, a template picker, and
 * NEW / OLD panes each with a file picker, sheet picker and drop zone.
 *
 * Two changes. The live version opens as a window on top of the RFQ window — a
 * modal over a modal, two escapes from the record, with the one underneath
 * still interactive. And it renders both upload panes whichever mode you pick;
 * here the panes follow the choice.
 */
const ACTIONS = [
  { value: 'upload',   label: 'Compare two uploaded files' },
  { value: 'mixed',    label: 'Compare an uploaded file with an existing assembly' },
  { value: 'existing', label: 'Compare two existing assemblies' },
];

export function BomComparisonDialog({ onClose }: { onClose: () => void }) {
  const [action, setAction] = useState('upload');
  const [summary, setSummary] = useState(false);
  const [template, setTemplate] = useState('Default BoM template');
  const toast = useToast();

  return (
    <Dialog
      open size="lg" title="BoM Comparison"
      subtitle="Compare two bills of materials and list what was added, removed or changed."
      onClose={onClose}
      actions={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="filled"
                onClick={() => { toast.notImplemented('run the comparison and list added, removed and changed lines'); onClose(); }}>
          Compare
        </Button>
      </>}
    >
      <div className="vy-bom-compare">
        <section>
          <h3 className="vy-field-group-title">What do you want to compare?</h3>
          <RadioGroup label="Comparison mode" options={ACTIONS} value={action} onChange={setAction} />
        </section>

        <section>
          <h3 className="vy-field-group-title">Template</h3>
          <Select label="Template" value={template} onChange={setTemplate}
                  options={['Default BoM template', 'Customer supplied', 'Legacy import']} />
          <p className="vy-hint">
            The template tells the comparison which spreadsheet columns hold the part number,
            revision and quantity.
          </p>
        </section>

        <div className="vy-bom-panes">
          <BomPane title="New BoM" upload={action === 'upload' || action === 'mixed'} />
          <BomPane title="Old BoM" upload={action === 'upload'} />
        </div>

        <Checkbox checked={summary} onCheckedChange={setSummary}
                  label="Show a summary only — counts of added, removed and changed lines rather than every row" />
      </div>
    </Dialog>
  );
}

function BomPane({ title, upload }: { title: string; upload: boolean }) {
  const [sheet, setSheet] = useState('Sheet1');
  const [assembly, setAssembly] = useState('00455-400-0123-01-F');
  const toast = useToast();
  return (
    <section className="vy-bom-pane">
      <h3 className="vy-field-group-title">{title}</h3>
      {upload ? (
        <>
          <div className="vy-dropzone">
            <strong>Drop a BoM file here</strong>
            <span>or</span>
            <Button onClick={() => toast.notImplemented('open a file picker for the BoM spreadsheet')}>
              Select file…
            </Button>
            <p className="vy-hint">.xlsx or .csv</p>
          </div>
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Sheet</span>
            <Select label="Sheet" value={sheet} onChange={setSheet}
                    options={['Sheet1', 'BOM', 'Consolidated']} />
          </label>
        </>
      ) : (
        <label className="vy-inline-field vy-inline-field--stack">
          <span>Assembly</span>
          <Select label="Assembly" value={assembly} onChange={setAssembly}
                  options={['00455-400-0123-01-F', '00848-857-6041-01-F', '01204-716-8295-01-F']} />
        </label>
      )}
    </section>
  );
}
