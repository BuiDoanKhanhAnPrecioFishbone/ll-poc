import { useState } from 'react';
import { Dialog, Tabs } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { MiniTable } from '../../ui/MiniTable';
import { useToast } from '../../ui/Toast';
import type { ColumnSpec } from '../column-model';

export type NewContact = { id: string; name: string; title: string; email: string; phone: string };

/**
 * Create New Customer — the Contact tab.
 *
 * Reached from Add Contact, which appears under the Customer field once an RFQ
 * created with "New Customer?" has been saved. The guideline: "the system
 * displays the Create New Customer modal and allows the user to add one or
 * more contacts for that new customer in the Contact tab", after which "all
 * contacts belonging to that customer are listed in the Customer Contact
 * dropdown on the Project Requirement Details screen".
 *
 * Only the Contact tab is built. The modal's other tabs belong to Customer
 * Management, a module this prototype does not cover, and guessing at their
 * fields would put invented requirements in front of the reviewer — the failure
 * this project has already made once. The tab strip shows they exist and says
 * so, which is the honest version of the same information.
 */
export function AddContactDialog({ open, customer, contacts, onClose, onAdd }: {
  open: boolean;
  customer: string;
  contacts: NewContact[];
  onClose: () => void;
  onAdd: (c: NewContact) => void;
}) {
  const toast = useToast();
  const [tab, setTab] = useState('contact');
  const [form, setForm] = useState({ name: '', title: '', email: '', phone: '' });

  /* A contact without a name is not a contact. Everything else about a person
     can be filled in later and often is — the guideline names no required
     fields here, so this is the minimum that makes the record meaningful
     rather than an invented validation rule.

     A name already on the list is refused as well. Two contacts with the same
     name make two dropdown entries that cannot be told apart, and the Customer
     Contact field renders the text of EVERY option matching its value — so a
     duplicate shows up there as the name printed twice. */
  const name = form.name.trim();
  const duplicate = contacts.some(c => c.name.toLowerCase() === name.toLowerCase());
  const canAdd = name.length > 0 && !duplicate;

  function add() {
    if (!canAdd) return;
    onAdd({ id: `c-${name}-${contacts.length}`, ...form, name });
    setForm({ name: '', title: '', email: '', phone: '' });
    toast.success(`${name} added to ${customer}.`);
  }

  const columns: ColumnSpec<NewContact>[] = [
    { field: 'name', title: 'Name', role: 'ident' },
    { field: 'title', title: 'Job Title', role: 'text' },
    { field: 'email', title: 'Email', role: 'text' },
    /* Not `code` (96px): an international number with its spaces is about
       fifteen characters and wrapped onto two lines in the code width. */
    { field: 'phone', title: 'Phone', role: 'code', width: 150,
      widthNote: 'An international dialling number, spaces included.' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Create New Customer"
      subtitle={<>Contacts for <strong>{customer}</strong></>}
      actions={<Button variant="filled" onClick={onClose}>Done</Button>}
    >
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'contact', label: 'Contact', count: contacts.length, content: (
            <div className="vy-contact-form">
              <div className="vy-contact-fields">
                <TextField label="Name" value={form.name} placeholder="Full name"
                           hint={duplicate ? 'Already a contact for this customer.' : undefined}
                           aria-invalid={duplicate || undefined}
                           onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <TextField label="Job Title" value={form.title}
                           onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <TextField label="Email" type="email" value={form.email}
                           onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <TextField label="Phone" value={form.phone}
                           onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <Button variant="filled" onClick={add} disabled={!canAdd}
                        title={duplicate
                          ? `${name} is already a contact for this customer`
                          : canAdd ? 'Add this contact' : 'A contact needs a name'}>
                  Add contact
                </Button>
              </div>

              {/* "one or more contacts" — so the list stays on screen while you
                  add the next one, and the Customer Contact dropdown behind
                  this modal fills as you go. */}
              <MiniTable
                data={contacts}
                columns={columns}
                empty={
                  <div className="vy-empty-inline">
                    <strong>No contacts yet.</strong> Add at least one and they become the
                    choices in Customer Contact on the RFQ.
                  </div>
                }
              />
            </div>
          ) },
          { value: 'details', label: 'Customer Details', content: (
            <div className="vy-empty-inline">
              <strong>Not in this prototype.</strong> The rest of Create New Customer belongs to
              Customer Management, which is outside the Project Requirement scope agreed for this
              phase. Its fields are not guessed at here.
            </div>
          ) },
        ]}
      />
    </Dialog>
  );
}
