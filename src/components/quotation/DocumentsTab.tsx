import { FileRow } from '../../ui/Files';
import { SectionHeading } from '../../ui/Group';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/icons';
import { useToast } from '../../ui/Toast';
import { fmtDate } from '../../ui/regional';
import type { Quotation } from '../../data/quotations';

/**
 * Every file attached to this RFQ, in one place.
 *
 * WHAT IT IS BUILT FROM, AND WHAT IT IS NOT. No source document asks for this
 * tab, and the data model has no document list — so nothing here is invented
 * data. It is a VIEW of the two kinds of file the record already holds:
 *
 *   checklist documents   one per selected checklist task, with the uploader,
 *                         the date and whether it has been approved
 *   BoM files             one per quotation run that was started from an
 *                         uploaded BoM rather than from the one on the record
 *
 * The second is the reason this is not simply the Checklists tab read twice.
 * A BoM file appears nowhere else as a FILE: on the Quotation Result tab it is
 * a column of a run. The question "what has been attached to this RFQ" had no
 * screen that answered it.
 *
 * THE TWO TABS ANSWER DIFFERENT QUESTIONS, which is the test `SmartButtons`
 * sets for a second list of the same records: Checklists is about TASKS — who
 * owns one, what state it is in, approve it — and this is about FILES — what
 * is here, who put it there, open it. Same records underneath the first half,
 * different question, and neither can be answered by reading the other.
 *
 * WHAT IS NOT HERE. No upload: a document is attached to its checklist task,
 * which is where the guideline puts the Upload and Approve buttons, and a
 * second way in would be a second place to get it wrong. No delete, for the
 * same reason.
 */
export function DocumentsTab({ q }: { q: Quotation }) {
  const toast = useToast();

  const taskDocs = q.tasks.filter(t => t.documentName);
  const bomFiles = q.results.filter(r => r.bomFile);

  if (!taskDocs.length && !bomFiles.length) {
    return (
      <div className="vy-empty-inline">
        No files on this RFQ yet. Checklist documents are attached on the
        Checklists &amp; Assignment tab; a BoM file arrives with a quotation run
        that was started from one.
      </div>
    );
  }

  const download = (name: string) => (
    <Button size="sm" icon={<Icon name="download" size={14} />}
            aria-label={`Download ${name}`}
            onClick={() => toast.notImplemented(`download ${name}`)} />
  );

  return (
    <div className="vy-doc-tab">
      {taskDocs.length > 0 && (
        <section>
          <SectionHeading>Checklist documents</SectionHeading>
          {taskDocs.map(t => (
            <FileRow key={t.type} name={t.documentName}
                     /* The task is the useful context — a file called
                        `DFM-Report-Acme.xlsx` says which checklist it answers
                        only if you already know the naming. */
                     meta={<>{t.type} · {t.uploadedBy}
                       {t.uploadedDate && <> · {fmtDate(t.uploadedDate)}</>}
                       {t.approved && <> · Approved</>}</>}
                     onPreview={() => toast.notImplemented(`preview ${t.documentName}`)}
                     action={download(t.documentName)} />
          ))}
        </section>
      )}

      {bomFiles.length > 0 && (
        <section>
          <SectionHeading>BoM files</SectionHeading>
          {bomFiles.map(r => (
            <FileRow key={r.id} name={r.bomFile}
                     meta={<>{r.partNumber} · Version {r.lastRunVersion} · {r.lastRunBy} · {fmtDate(r.lastRunDate)}</>}
                     onPreview={() => toast.notImplemented(`preview ${r.bomFile}`)}
                     action={download(r.bomFile)} />
          ))}
        </section>
      )}
    </div>
  );
}
