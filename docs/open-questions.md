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

## Two defects in the live system, for your backlog

Not questions, just things we noticed and you may not have:

- The grid column reads **`OrderType`** with no space, and **`Created Date `**
  carries a trailing space. Both are in the column definitions.
- The **Sort** tab of View Setting repeats the Column tab's instruction word for
  word — it tells the user to "add or remove **columns**" on a sorting panel —
  and its add button reads **"Add a column"**.
- The stock demo chart *"World Population by Broad Age Groups"* is still on the
  live Home page in production.
