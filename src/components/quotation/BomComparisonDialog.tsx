import { useState } from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { RadioGroup, Checkbox } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { DIALOG_WIDTH } from '../../theme/tokens';
import { useToast } from '../Toast';

/**
 * BoM Comparison.
 *
 * Structure is verbatim from the live dialog: a "Select Action" choice of three
 * comparison modes, a template picker, and NEW BOM / OLD BOM panes each with a
 * file picker, sheet picker and drop zone, plus a "Compare As Summary" toggle.
 *
 * Two UX changes:
 *
 * 1. The live version opens as a Kendo Window ON TOP OF the RFQ Window — a modal
 *    over a modal, so you are two escape presses from the record and the one
 *    underneath is still interactive. Here the RFQ is a page, so this is a
 *    single dialog over a page.
 * 2. The action choice governs which panes are relevant, but the live dialog
 *    renders both upload panes regardless. Here the panes follow the choice.
 */
const ACTIONS = [
  { label: 'Compare two uploaded files', value: 'upload' },
  { label: 'Compare an uploaded file with an existing assembly', value: 'mixed' },
  { label: 'Compare two existing assemblies', value: 'existing' },
];

export function BomComparisonDialog({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [action, setAction] = useState('upload');
  const [summary, setSummary] = useState(false);

  const newNeedsUpload = action === 'upload' || action === 'mixed';
  const oldNeedsUpload = action === 'upload';

  return (
    <Dialog title="BoM Comparison" onClose={onClose} width={DIALOG_WIDTH.wide}>
      <div className="vy-bom-compare">
        <section>
          <h3 className="vy-field-group-title">What do you want to compare?</h3>
          <RadioGroup data={ACTIONS} value={action}
                      onChange={e => setAction(String(e.value))} />
        </section>

        <section className="vy-bom-template">
          <h3 className="vy-field-group-title">Template</h3>
          <DropDownList data={['Default BoM template', 'Customer supplied', 'Legacy import']}
                        defaultValue="Default BoM template" />
          <p className="vy-hint">
            The template tells the comparison which spreadsheet columns hold the part
            number, revision and quantity.
          </p>
        </section>

        <div className="vy-bom-panes">
          <BomPane title="New BoM" upload={newNeedsUpload} />
          <BomPane title="Old BoM" upload={oldNeedsUpload} />
        </div>

        <Checkbox value={summary} onChange={e => setSummary(Boolean(e.value))}
                  label="Show a summary only — counts of added, removed and changed lines rather than every row" />
      </div>

      <DialogActionsBar>
        <Button onClick={onClose}>Cancel</Button>
        <Button themeColor="primary"
                onClick={() => { toast.notImplemented('run the comparison and list added, removed and changed lines'); onClose(); }}>
          Compare
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}

function BomPane({ title, upload }: { title: string; upload: boolean }) {
  const toast = useToast();
  return (
    <section className="vy-bom-pane">
      <h3 className="vy-field-group-title">{title}</h3>
      {upload ? (
        <>
          <div className="vy-dropzone">
            <strong>Drop a BoM file here</strong>
            <span>or</span>
            <Button themeColor="base" onClick={() => toast.notImplemented('open a file picker for the BoM spreadsheet')}>
              Select file…
            </Button>
            <p className="vy-hint">.xlsx or .csv</p>
          </div>
          <label className="vy-inline-field">
            <span>Sheet</span>
            <DropDownList data={['Sheet1', 'BOM', 'Consolidated']} defaultValue="Sheet1" />
          </label>
        </>
      ) : (
        <label className="vy-inline-field vy-inline-field--stack">
          <span>Assembly</span>
          <DropDownList
            data={['00455-400-0123-01-F', '00848-857-6041-01-F', '01204-716-8295-01-F']}
            defaultValue="00455-400-0123-01-F" />
        </label>
      )}
    </section>
  );
}
