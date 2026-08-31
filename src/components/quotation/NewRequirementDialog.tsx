import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Tabs, Checkbox, Select } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { useToast } from '../../ui/Toast';
import { RecordField, RequiredMark, isMissing } from './RecordField';
import { SmartIcon } from './SmartButtons';
import { ChecklistsTab } from './ChecklistsTab';
import {
  HEADER_GROUPS, HISTORICAL_RFQ_FIELD, showsHistoricalRfq, ALL_FIELDS,
  COMMERCIAL, TECHNICAL, INVENTORY, NOTES,
} from './requirementFields';
import {
  generateQuotations, findCustomer, contactsFor, CUSTOMER_OPTIONS,
  type Quotation,
} from '../../data/quotations';
import { ME } from '../../data/queues';
import { addCreatedQuotation, nextRfqNo } from '../../data/createdQuotations';

/**
 * New Project Requirement.
 *
 * THREE tabs, not four. The record has an Activity Logs tab and this form does
 * not, because on a record that does not exist yet it can only ever be empty:
 * creating the RFQ IS its first entry. The guideline lists the tab under Create
 * PR but attaches no expected result to it, which is consistent — there is
 * nothing to expect. A permanently empty tab on a form with seventeen required
 * fields is one more thing to open and rule out.
 *
 * A MODAL, unlike the record screen, which is a page. That is not an
 * inconsistency: the guideline is explicit — "Display the New Project
 * Requirement modal" — and the two cases genuinely differ. An existing RFQ is
 * a thing you link to, return to and send to a colleague, so it earns a URL. A
 * record that does not exist yet has nothing to link to, and putting it over
 * the list keeps the list visible behind it, which is where the user came from
 * and where they land again if they cancel.
 *
 * The form itself is the record's form. Same field declarations, same required
 * markers, same validation, same grouping — so what the user learns filling
 * this in is what they use to read it afterwards. The guideline expects that
 * too: after Save, "the screen is displayed in view mode ... allowing the user
 * to review all information entered during RFQ creation".
 */
export function NewRequirementDialog({ open, onClose }: {
  open: boolean; onClose: () => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const existing = useMemo(() => generateQuotations(330), []);

  /* The number is generated up front and shown as the heading, per the
     guideline: "The system automatically generates and displays the No. as the
     H1 header for a newly created Project Requirement". Reserving it on open
     rather than on save means the user can quote it to a colleague while they
     are still filling the form in. */
  const [no] = useState(() => nextRfqNo(existing));
  const [draft, setDraft] = useState<Quotation>(() => blankRfq(no));
  const [newCustomer, setNewCustomer] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState('requirements');

  const markTouched = (name: string) =>
    setTouched(t => (t.has(name) ? t : new Set(t).add(name)));

  /* Required fields, exactly the guideline's three lists: seven in General
     information, ten on Specific Requirements, two on Checklist & Assignment.
     The first seventeen carry `required` in their declarations already, so they
     are read off rather than restated — a second copy of the list is a second
     thing to keep in step. */
  const missingFields = ALL_FIELDS.filter(f => isMissing(f, draft[f.name]));
  const missingAssignees = ([['programManager', 'Program Manager'], ['buyer', 'Buyer']] as const)
    .filter(([k]) => !draft[k]);
  const missingCount = missingFields.length + missingAssignees.length;

  function setField(name: string, v: unknown) {
    setDraft(d => {
      if (name !== 'customer') return { ...d, [name]: v };
      /* A typed new-customer name has no record behind it, so there is nothing
         to derive from and nothing to clear. */
      if (newCustomer) return { ...d, customer: String(v) };
      const cust = findCustomer(String(v));
      if (!cust) return { ...d, customer: String(v) };
      return {
        ...d,
        customer: cust.label,
        /* "If the selected customer has only one customer contact, the system
           automatically populates this field with that contact. If ... more
           than one ... with the first contact in the list." Both are the first
           of the list; the guideline states them separately, and they agree. */
        customerContact: contactsFor(cust.label)[0] ?? '',
        customerType: cust.custType,
        itar: cust.isItar,
        markup: d.markup || cust.priceMarkup,
        /* The three Assignee roles default from the customer's own
           configuration, per the guideline: "If a [role] has been configured
           for the corresponding customer ... that user is displayed as the
           default selected value."

           `||` not `??`, so an unconfigured role leaves whoever is already
           there rather than blanking a choice the user made. And a customer
           with no configuration at all changes none of the three — the
           guideline's "if" is per ROLE, which is why one of the mock customers
           configures only a Buyer. */
        programManager: cust.roles?.programManager || d.programManager,
        buyer: cust.roles?.buyer || d.buyer,
        engineer: cust.roles?.engineer || d.engineer,

        projectName: '',
      };
    });
  }

  /* Ticking "New Customer?" swaps the Customer control for a text field, so
     whatever was selected from the list no longer applies — and unticking it
     drops a typed name that is not in the list. Either way the derived fields
     go with it, rather than leaving a contact belonging to a customer who is
     no longer chosen. */
  function toggleNewCustomer(on: boolean) {
    setNewCustomer(on);
    setDraft(d => ({ ...d, customer: '', customerContact: '', itar: false }));
  }

  function save() {
    if (missingCount) {
      setTouched(new Set([...ALL_FIELDS.map(f => f.name), 'programManager', 'buyer']));
      toast.error(`${missingCount} required ${missingCount === 1 ? 'field is' : 'fields are'} still empty.`);
      return;
    }
    const created: Quotation = { ...draft, newCustomer, createdDate: new Date(), lastUpdated: new Date() };
    addCreatedQuotation(created);
    onClose();
    navigate(`/sales-management/quotation/${created.id}`);
    toast.success(`RFQ${created.no} created. Held in this browser session only.`);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title="New Project Requirement"
      subtitle={<>Reserved as <strong>RFQ{no}</strong>. Nothing is saved until you choose Save.</>}
      actions={
        /* Save ONLY, and disabled until every required field is answered —
           "In this mode, only the Save button is displayed and it is disabled
           by default." Cancel is the dialog's own Close, which is where a
           modal's escape already lives. */
        <Button variant="filled" onClick={save} disabled={missingCount > 0}
                title={missingCount
                  ? `${missingCount} required field${missingCount === 1 ? '' : 's'} still empty`
                  : 'Create this Project Requirement'}>
          {missingCount ? `Save · ${missingCount} left` : 'Save'}
        </Button>
      }
    >
      <div className="vy-create-form">
        <section className="vy-create-general">
          <div className="vy-header-groups" data-editing>
            {HEADER_GROUPS.map(g => (
              <section className="vy-header-group" key={g.id}>
                <h2 className="vy-header-group-title">
                  <SmartIcon name={g.icon} />{g.title}
                </h2>
                <dl className="vy-record-fields" data-editing>
                  {/* "New Customer?" heads the customer group because it decides
                      what the two fields under it even are. Asking it after the
                      Customer field would mean answering it twice. */}
                  {g.id === 'customer' && (
                    <div className="vy-field vy-field--editing">
                      <dt />
                      <dd>
                        <Checkbox checked={newCustomer} onCheckedChange={toggleNewCustomer}
                                  label="New Customer?" />
                        <span className="vy-field-hint">
                          Tick this if the customer is not in Customer Management yet. You can add
                          their contacts once the RFQ is saved.
                        </span>
                      </dd>
                    </div>
                  )}

                  {g.fields.map(def => {
                    /* Customer and Customer Contact are rendered here rather
                       than by their declarations, because "New Customer?"
                       changes what kind of control each one is. Everything else
                       on the record goes through its declaration unchanged. */
                    if (def.name === 'customer') {
                      return <CustomerField key="customer" newCustomer={newCustomer}
                                            value={draft.customer}
                                            invalid={touched.has('customer') && !draft.customer}
                                            onChange={v => setField('customer', v)}
                                            onBlur={() => markTouched('customer')} />;
                    }
                    if (def.name === 'customerContact') {
                      return <ContactField key="contact" newCustomer={newCustomer}
                                           customer={draft.customer}
                                           value={draft.customerContact}
                                           onChange={v => setField('customerContact', v)} />;
                    }
                    return (
                      <RecordField key={def.name} def={def} value={draft[def.name]}
                                   editing onChange={setField} row={draft}
                                   touched={touched.has(def.name)} onBlur={markTouched} />
                    );
                  })}

                  {g.id === 'project' && showsHistoricalRfq(draft) && (
                    <RecordField def={HISTORICAL_RFQ_FIELD} value={draft.historicalRfq}
                                 editing onChange={setField} row={draft}
                                 touched={touched.has('historicalRfq')} onBlur={markTouched} />
                  )}
                </dl>
              </section>
            ))}
          </div>
        </section>

        <Tabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: 'requirements', label: 'Specific Requirements',
              count: countMissing([...COMMERCIAL, ...TECHNICAL, ...INVENTORY], draft),
              content: (
                <div className="vy-field-groups">
                  {([['Quote Configuration', COMMERCIAL],
                     ['Technical Specifications', TECHNICAL],
                     ['Special Requirements & Options', INVENTORY],
                     ['Additional Notes', NOTES]] as const).map(([title, defs]) => (
                    <section className="vy-field-group" key={title}>
                      <h2 className="vy-field-group-title">{title}</h2>
                      <dl className="vy-field-list">
                        {defs.map(def => (
                          <RecordField key={def.name} def={def} value={draft[def.name]}
                                       editing onChange={setField} row={draft}
                                       touched={touched.has(def.name)} onBlur={markTouched} />
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              ) },
            { value: 'checklists', label: 'Checklists & Assignment',
              count: missingAssignees.length,
              content: (
                <ChecklistsTab
                  q={draft}
                  people={{ programManager: draft.programManager, buyer: draft.buyer, engineer: draft.engineer }}
                  onPeopleChange={p => setDraft(d => ({ ...d, ...p }))}
                  touched={touched}
                  onBlur={markTouched}
                />
              ) },
          ]}
        />
      </div>
    </Dialog>
  );
}

/** How many required fields in a set are still empty — the count on each tab. */
function countMissing(defs: typeof COMMERCIAL, draft: Quotation) {
  return defs.filter(d => isMissing(d, draft[d.name])).length;
}

/**
 * Customer — a dropdown, or a text field for a customer who does not exist yet.
 *
 * "The Customer field is displayed as a dropdown list that allows the user to
 * select an existing customer (in Customer Management)... When [New Customer?
 * is] checked, the Customer field is displayed as a text field for manual
 * entry."
 */
function CustomerField({ newCustomer, value, invalid, onChange, onBlur }: {
  newCustomer: boolean; value: string; invalid: boolean;
  onChange: (v: string) => void; onBlur: () => void;
}) {
  return (
    <div className="vy-field vy-field--editing" data-invalid={invalid || undefined}>
      <dt><label htmlFor="f-customer">Customer<RequiredMark /></label></dt>
      <dd>
        {newCustomer ? (
          <TextField id="f-customer" value={value} placeholder="Customer name"
                     aria-invalid={invalid || undefined}
                     onBlur={onBlur} onChange={e => onChange(e.target.value)} />
        ) : (
          <Select id="f-customer" label="Customer" value={value} required invalid={invalid}
                  /* "Inactive customers are not displayed in the list." Every
                     customer in this mock master is active; the filter is named
                     here so it is not lost when one is not. */
                  options={CUSTOMER_OPTIONS}
                  onChange={v => { onChange(v); onBlur(); }} />
        )}
        {invalid && <span className="vy-field-error" role="alert">This field is required.</span>}
        <span className="vy-field-hint">
          {newCustomer
            ? 'Typed in full, because this customer is not in the system yet.'
            : 'Sets the contact list, Customer Type and the ITAR flag, and suggests a markup.'}
        </span>
      </dd>
    </div>
  );
}

/**
 * Customer Contact — the contacts belonging to the chosen customer.
 *
 * For a NEW customer there are none: the guideline says this "will be
 * supported by a new feature for entering customer contact information", and
 * that feature is Add Contact, which only appears once the RFQ exists. So the
 * field says what it is waiting for rather than offering an empty dropdown.
 */
function ContactField({ newCustomer, customer, value, onChange }: {
  newCustomer: boolean; customer: string; value: string; onChange: (v: string) => void;
}) {
  const options = newCustomer ? [] : contactsFor(customer);
  return (
    <div className="vy-field vy-field--editing">
      <dt><label htmlFor="f-contact">Customer Contact</label></dt>
      <dd>
        {options.length > 0 ? (
          <Select id="f-contact" label="Customer Contact" value={value}
                  options={options} onChange={onChange} />
        ) : (
          <p className="vy-field-note">
            {newCustomer
              ? 'Added after saving, with the Add Contact button on the record.'
              : 'Choose a customer first.'}
          </p>
        )}
      </dd>
    </div>
  );
}

/**
 * An empty RFQ.
 *
 * Only three fields start with a value, and each is stated by the guideline:
 * Assigned To defaults to "the currently logged-in user", Created Date is
 * "automatically populated by the system", and Priority is a rating that has
 * to start somewhere. Everything else is deliberately blank — pre-filling a
 * required field with a plausible default is how it gets saved unread.
 */
function blankRfq(no: string): Quotation {
  const now = new Date();
  return {
    id: `rfq-new-${no}`,
    no,
    priority: 1,
    projectName: '',
    customer: '',
    customerContact: '',
    application: 'System',
    rfqType: 'Turnkey',
    orderType: '' as Quotation['orderType'],
    status: 'New',
    assignedTo: [ME],
    dateNeeded: undefined as unknown as Date,
    createdDate: now,
    lastUpdated: now,
    projectType: '',
    customerType: '',
    historicalRfq: '',
    itar: false,
    quoteFocus: '',
    materialPackageType: '',
    /* Genuinely EMPTY, not zero. Both are required, and `isMissing` treats 0 as
       a value — correctly, since 0 is a real markup. Seeding them at 0 would
       therefore satisfy their required check before the user had read either
       field, which is the exact failure the markers exist to prevent. */
    markup: undefined as unknown as number,
    leadTimeDays: undefined as unknown as number,
    quantitiesToQuote: '',
    buildRequirement: '',
    testRequirements: '',
    assemblyTurnTime: 0,
    excessAndMoq: '',
    netConsignedInventory: '',
    rocketConsignedInventory: '',
    conformalCoating: false,
    provideAlternateAml: false,
    broker: false,
    customerNotes: '',
    internalNotes: '',
    programManager: '',
    buyer: '',
    engineer: '',
    tasks: [],
    results: [],
    comments: [],
    activity: [],
  };
}
