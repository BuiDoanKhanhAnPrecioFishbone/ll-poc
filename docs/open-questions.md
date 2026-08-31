# Open questions for the client

Eight things the prototype cannot settle on its own. Each states what we found,
what we did in the meantime, and what we need from you.

Nothing here is blocking — the prototype works under a stated assumption in
every case. But each assumption is one we would rather you confirmed than
discovered later.

---

## 1. Where should row actions live?

**What we found.** Your Testing Guideline lists a **View Detail** column first
on the Project Requirements list, and the live system has one — an eye icon on
every row.

**Why we are asking.** Two reasons.

That column is the KendoReact grid's *command column*, which ships in the
component's own demos. It is very likely a component default rather than a
decision anyone made about this screen.

And your own notes plan a **second** row action: the Note sheet says Historical
RFQ is being replaced by *"duplicate record (clone)"*. One eye icon is fine. An
eye plus a clone icon is a stripe of buttons down the left of every row, and
whatever comes third makes it worse.

**What the wider market does.** Almost every major system opens a record from
its **title or identifier** — Jira, Linear, GitHub, Asana, Monday, HubSpot,
Salesforce. Where they carry row actions, those sit in a **trailing** overflow
menu (`⋯`), not a leading icon. Notion and Airtable reveal an expand control on
hover rather than reserving a column for it.

**What we have done.** Built the eye column to match your guideline, then removed
it. The RFQ number is now the link — it costs no column, supports open-in-new-tab,
and leaves the row itself unclickable so text can still be selected and copied,
which your estimators do daily.

**What we need.** Your call on one of three:
- **a)** Put the eye column back, as the guideline specifies.
- **b)** Leave it as it is — identifier links, no action column.
- **c)** Plan a trailing `⋯` menu now, so clone and anything after it have a home.

We would suggest (c), decided before clone ships rather than after.

---

## 2. KendoReact licence

We have no licence, so the prototype is built on licence-free (MIT) components.
Every functional requirement in your review is met either way.

See `docs/kendo-license-activation.md` for how activation works. In short we need
either a licence key file, or named developer seats — **only the licence holder
can generate the key**, so we cannot do it for you.

If you want to move to KendoReact, it is worth deciding **before** that work is
scheduled: it would replace the grid, dialogs, dropdowns, date inputs and form
controls.

---

## 3. Rocket Consigned Inventory — your two documents disagree

| Source | Options |
|---|---|
| Live system | `No` · `Yes-No Charge` · `Yes-Charge` |
| Testing Guideline | `None` · `Yes - No Charge` · `Yes - Charge` |

The guideline's entry for the **parallel** field, Net Consigned Inventory, uses
`No` and `Yes-No Charge` — unspaced, starting with "No". So the guideline
contradicts itself between two fields of otherwise identical shape, which reads
as a typo in the Rocket entry.

**We built the live values**, because those are what the API accepts and a
mismatch would make the finished system reject valid input.

**Which is correct?** If the guideline is right, the live system needs changing
too — not just the prototype.

---

## 4. Date format — your two sources disagree

The **Testing Guideline** says date and time columns use the format configured in
*System Configuration → Region Language Format Config* — an administrator
setting, one format for everyone.

The **design review** asked for the user to choose between an exact date and a
count from today — a per-user preference.

These cannot both be true. We have built it as a user preference and flagged it.

**Update, 27 Aug.** The Create PR sheet is more specific than either: Due Date
"accepts the date in MM/DD/YYYY format" with a `month/day/year` placeholder, and
Created Date "displays in MM/DD/YYYY HH:MM:SS format". The prototype currently
renders dates as `15 Oct 2026` and uses the browser's native date picker, which
shows `dd/mm/yyyy` in a European locale and `mm/dd/yyyy` in a US one — so today
it follows the *reader's* machine, not either of your sources. Confirm
MM/DD/YYYY and we will pin it, and add the time to Created Date.

---

## 5. "Assigned To" is not available on the list

It is not a column on the live list, and the Column tab does not offer it, so a
user cannot turn it on either.

That leaves an estimator unable to see who owns a row without opening it — and
the My Queues screen, which you have asked us to build later, is entirely based
on assignment.

**Should Assigned To become an available column?** We think yes, but it is an
addition to your system rather than a gap in ours.

---

## 6. Priority — stars or a label?

The **Testing Guideline** says Priority uses star icons. The **design review**
asked for a coloured dot with High / Medium / Low.

We have followed the review, as it is the more recent and more specific
instruction. Flagging so nobody later reads it as a regression.

**Update, 27 Aug.** The Create PR sheet repeats the guideline's side of this —
"Allows the user to set the RFQ priority using a rating input ... Displays a
tooltip on hover corresponding to the selected level: Low, Medium, or High" —
so the disagreement is between two of your own documents, not between your
document and our judgement. Still built as the review asked.

---

## 7. Where does "Quoted" come from?

`Quoted` appears as a status on the list grid, but it is not in the RFQ status
list we can find. Is it a real status, a derived one, or something else?

---

## 8. What does "Build Requirement" choose from?

There is no `BUILD_REQUIREMENT` metadata code. The only live value we observed
was "System", which belongs to the Application list, so the prototype reuses
that list — **an inference, not a lookup**, and the one option list still worth
confirming.

---

## 9. Should a record open as a modal, and should dialogs minimise?

Two parts, both from running your `PR - PR List` test sheet against the build.

**The record.** Your guideline says the detail opens as a modal, three times.
Ours opens as a full page. The reason written down at the time was that a modal
has no URL, so you cannot send a colleague a link to an RFQ.

**That reason was wrong.** Checking the live system on 27 August, the record
dialog *does* have its own URL. So the decision rested on something untrue. A
page may still be better — it gives a browser back button and a breadcrumb — but
that is now a preference, not a correction, and it is yours to make.

**Minimise.** Your guideline asks every dialog for Minimize, Maximize/Restore
Down and Close. We have built Maximize and Close.

Minimize we have left out, and want to check rather than guess. In Kendo it
collapses a *draggable* window down to its title bar, in place. Our dialogs are
centred and modal, so minimising one would leave a title bar floating in the
middle of a dimmed screen — which does not achieve what minimising is for.

If your users minimise a dialog to read the list underneath it, the real answer
is a non-modal draggable window. That is a different component, and worth
knowing before it gets built rather than after.

---

## 10. Are "RFQ Type" and "Customer Type" the same field?

The **PR List** sheet specifies an **RFQ Type** column. The **Create PR** sheet
specifies a required **Customer Type** field on the form, and gives it the same
four values: Consigned, Managed Consigned, Mixed, Turnkey.

Meanwhile the shipped system carries a *different* Customer Type, written from
the customer record's `custType` and never editable, whose values are TBD,
Consign, Turnkey and Hybrid.

So there are two labels, two option lists and two behaviours across three
sources. We have followed the guideline — Customer Type is now user-selectable
with your four values, defaulting from the customer record — and kept RFQ Type
as its own column, because your list sheet asks for it. If they are one field
under two names, tell us and we will merge them; that is not a change we will
make on a guess.

**Related:** the guideline also says Customer Contact "is read-only" and, four
lines later, that "the user can select a different customer contact from the
list". We have built it as selectable. Worth a correction in your document.

---

## 11. Two things Quick Quote does not tell us

**a. Add: Packages — what is "Total Quantity"?** The sheet says it updates
"accordingly" when Select Quantity is entered, without saying how. We have read
Select Quantity as *per board* and Total Quantity as that times Build Qty, which
is the same relationship every other BoM line has. Read the other way — Total
Quantity simply echoing Select Quantity — the two fields are redundant and the
cost summary comes out wrong: a package entered as 50 raised Cost/Board by the
whole $21 instead of the $0.42 one board consumes. Please confirm.

**b. Did the MFG Mismatch Review panel move, or go?** The shipped system has a
panel on the Review BoM step listing BoM manufacturers that disagree with Z2Data,
offering *Link to an existing Manufacturer*, *Create a new Manufacturer* and *Add
to Alias*. Your Quick Quote sheet has no such panel — it has a *Missing
Manufacturer* filter instead. We have followed the sheet and removed the panel,
but this is us removing something that exists in your live system on the strength
of a document that does not mention it, which is the wrong way round if the sheet
is simply silent rather than deliberate. Tell us and it comes back.

---

## 12. Part Source — your two lists differ, and we found a third

Create New Part (§2.3) offers **BUY, CONSG, FLSTK, MAKE, MAKE/BUY, MAKE/PHAN**.
Quick Quote step 2 offers **BUY, MAKE, MAKE/PHAN, FLRSTK, MAKE/BUY, PACKAGING**.

We read the enumeration out of your live system rather than guess, and it holds
**nine** values: SERVICE, MAKE, BUY, CONSG, MAKE/PHAN, **MAKE/PHANT**, FLRSTK,
MAKE/BUY, PROG.

That answers two of the three differences on its own — `FLSTK` is a typo for
`FLRSTK`, and `MAKE/PHAN` and `MAKE/PHANT` are two real, separate values rather
than one misspelt one. Three things still need you:

1. **`PACKAGING` is not in your live system.** Should the Quick Quote sheet say
   `CONSG`, or does PACKAGING exist somewhere we cannot see?
2. **Should Create New Part offer SERVICE, MAKE/PHANT and PROG?** It offers the
   six your sheet names. A create form that cannot produce a value the system
   accepts is a limitation; adding three you did not ask for is not our call.
3. **Does the auto-exclusion rule cover MAKE/PHAN as well as MAKE/PHANT?** Your
   rule (Quick Quote r81) names MAKE/PHANT only. Both are phantom assemblies and
   neither is physically stocked, so excluding both looks right — but that is an
   inference, and it changes which lines get quoted.

## 13. Purchase Lead Time — days or weeks?

Your Testing Guideline says **"Purchase Lead Time (Days)"**. Your live form
labels the same field **"Purchase lead time (weeks)"**.

We built days, because your written requirement governs. A units mismatch on a
lead time is a seven-fold planning error in either direction, so please confirm
which is right — and if it is weeks, whether Kitting and Production Lead Time
(which your sheet gives in days, and which we have built in days) follow it.

## 14. Part Class and Part Type — what maps to what?

Your sheet requires that "only valid Part Type options mapped to the selected
Part Class are displayed", and we built that behaviour. **The mapping itself is
our guess**, because it is in neither document and your live form reads it from
the server.

We used the classes and types already in the prototype's data:

| Part Class | Part Types offered |
|---|---|
| ASSEMBLY | ELEC-PCB, MECH-FMA |
| COMPONENT | ELEC-PAS, 0402, 0603 |
| RAW | MECH-MCH |
| CONSUMABLE | MECH-MCH, ELEC-PAS |

Send us the real table and we will swap it in — it is one object in one file.
The same goes for **Order Policy**, where your sheet defines the field but names
no values; we offer Lot for lot, Fixed order quantity and Min/Max.

## 15. Create BoM — three label questions

We read this form's labels out of your live system's own resource bundle, so
they are verbatim. Three need you:

1. **"Create Custom Template" or "Create Customer Template"?** Your Testing
   Guideline writes the second; your live app shows the first — beside a
   separate field it calls *Customer Template*. We used your live wording. If
   the button creates a template *for a customer*, the live label may be the
   typo rather than the sheet.
2. **Material Type and BoM Type** are in your live BoM form's label set and not
   in the sheet's Assembly Info list. We built the sheet's list. Should either
   appear on Create BoM?
3. **Select Action is two checkboxes on your sheet** ("Import New BoM
   (checkbox, default selected)", "Load Existing BoM (checkbox)"). They are
   mutually exclusive in every other line of the same sheet — the whole form
   changes with the choice — so we built a radio group. Confirm that is right;
   if they really are checkboxes, what does ticking both mean?

## 16. MFG–MPN (AML) — two rules your sheet does not state

1. **Should the MPN Mapping table appear on every part, or only MAKE and
   MAKE/BUY?** Your step 1 says "Open a Part detail (Part has Part Source is
   MAKE, MAKE/BUY)", which reads as how to reach the screen rather than a rule
   about when it shows — elsewhere you write display rules explicitly ("the BoM
   button should be displayed **only when** Part Source = MAKE, MAKE/BUY or
   MAKE/PHAN"). We show it on every part, because an Approved Manufacturer List
   is most obviously needed on BUY parts, which are the ones you purchase. Tell
   us if it should be hidden on those.

2. **Can a part have more than one Primary, or none?** Order Preference is
   "purchasing priority (Primary/Alternate) guiding buyers", which implies one
   default — but you state no constraint, so we have not enforced one. The form
   *defaults* to Primary for a part's first manufacturer and warns when a part
   ends up with none. If the rule is exactly one Primary, we will enforce it.

Also, two label notes from your live system, for confirmation rather than
decision: it writes **"Total On Hand"** where the sheet writes "Total On-Hand"
(we used yours), and its Add MPN Mapping modal has a field labelled **"Is
Exsisting Mfg"** — a misspelling we have corrected to "Is Existing Mfg" on
screen, and one worth fixing in the live app too.

## Two defects in the live system, for your backlog

Not questions, just things we noticed and you may not have:

- The grid column reads **`OrderType`** with no space, and **`Created Date `**
  carries a trailing space. Both are in the column definitions.
- The **Sort** tab of View Setting repeats the Column tab's instruction word for
  word — it tells the user to "add or remove **columns**" on a sorting panel —
  and its add button reads **"Add a column"**.
- The stock demo chart *"World Population by Broad Age Groups"* is still on the
  live Home page in production.
