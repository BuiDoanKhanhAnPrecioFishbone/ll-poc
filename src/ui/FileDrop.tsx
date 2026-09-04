import { Upload, type UploadOnAddEvent, type UploadOnRemoveEvent } from '@progress/kendo-react-upload';

/**
 * Choose a file from this machine.
 *
 * PHASE 7 of docs/kendo-migration-scope.md, and the second capability win.
 * `live-component-sweep.md` recorded it plainly: "`k-upload` ships and we have
 * no file input at all — every upload in this prototype reports what it would
 * do." Five places need one: the BoM file on Run Quotation and on Create BoM,
 * a document on a checklist task, attachments on a new part, and the file for
 * BoM Comparison.
 *
 * NOTHING IS UPLOADED, AND THAT IS DELIBERATE. `autoUpload` is off and no
 * `saveUrl` is set, because there is no server to send to. What the user gets
 * is real and was missing: a file picker, drag and drop, the file's name and
 * size on screen, and the ability to remove it. What they do not get is a
 * transfer, and the caller says so rather than the control implying otherwise.
 *
 * This is the honest half of the feature. Parsing the spreadsheet — the column
 * detection, the merge rules, the MFG/MPN pairs — is a separate piece of work
 * that needs a real file reader, and it is recorded as unbuilt in the testing
 * docs. Choosing the file is the part that was missing from the UI.
 */
export function FileDrop({ onPick, accept = '.xlsx', multiple = false, hint }: {
  /** Called with the chosen file names. Empty when the last one is removed. */
  onPick: (names: string[]) => void;
  /** Extensions, as the file dialog's filter. */
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  return (
    <div className="vy-filedrop">
      <Upload
        batch={false}
        multiple={multiple}
        defaultFiles={[]}
        /* No `saveUrl`: with none set and autoUpload off, Kendo keeps the file
           client-side and never attempts a request. A saveUrl pointing at
           nothing would show every file as failed. */
        autoUpload={false}
        restrictions={{ allowedExtensions: accept.split(',').map(e => e.trim()) }}
        onAdd={(e: UploadOnAddEvent) => onPick(e.newState.map(f => f.name))}
        onRemove={(e: UploadOnRemoveEvent) => onPick(e.newState.map(f => f.name))}
      />
      <p className="vy-field-hint">
        {hint ?? `${accept} only.`} Chosen files stay in this browser — this prototype has
        nowhere to send them.
      </p>
    </div>
  );
}
