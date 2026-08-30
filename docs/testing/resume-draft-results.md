# Resume Draft Quote — Package 3

Built and run 30 Aug 2026, against `PR - EC - Resume Draft Quote` (guideline
§2956–3650).

**The sheet is 464 lines and one of them is new work.** Everything from
*Step 3 - Quoting* onward — the provider choice, Run Quote, Apply, Add
Attrition, Apply Price Range, the five searches, the three filters, the BoM
line formats, Save draft, Previous, Next, and the whole of Step 4 — is Quick
Quote's text, already built and already run. Compared line by line, the same
way Standard Quote was.

What is genuinely new is the **Continue from drafts** table on step 1, and the
jump it performs.

## Built

**A third entry point.** `Action` already carried the discriminator between
Quick Quote (`Import New BoM`) and Standard Quote (`Load Existing Assembly`).
Resume Draft is a third option on the same control — `Continue from drafts` —
because "which way am I starting" is the question that control already asks,
and a separate button elsewhere would ask it twice.

**The drafts table.** The guideline's seven columns in its order: Action,
Assembly Name, Revision, Description, Build Qty, Attrition Set, Created Date.
Rows are read-only as specified; the only control is Continue. Created Date
carries the time as well as the date, as the sheet asks — drafts of one
assembly are saved minutes apart and a date alone cannot separate two of them.

**Continue jumps to step 3**, per *"Redirect to Step 3 - Quoting for the
selected draft"*, with the draft's config, BoM lines and run state restored.

**Save draft now saves.** It previously showed the guideline's success message
and did nothing else, which left the flow named after resuming a draft with
nothing to resume. Drafts live in `src/data/draftQuotes.ts`.

## Deviations, all deliberate

**Drafts are session-only, and not written to localStorage.** This follows
`createdQuotations.ts`, which states the reason: a mock record surviving a page
reload makes the prototype look like it has a backend, and invites a reviewer
to test what it cannot do. In-memory covers what this flow has to demonstrate —
save, close the wizard, reopen, continue — because that happens in one session.
The toast says so.

**Saving the same assembly twice replaces its draft rather than adding a row.**
Save draft is reachable from both step 3 and step 4, so pressing it twice in a
sitting is ordinary. A table that grew a near-identical row each time would
bury the real one: the user is looking for "the assembly I was working on", not
"the fourth save of it". The toast distinguishes *saved* from *updated*.

**An empty state, which the guideline does not describe.** It opens with
*"Pre-condition: at least one previously saved draft quotation available"* and
says nothing about there being none — which is what a first-time user sees
every time. The empty state names where drafts come from, because the answer is
a control two options up the same screen.

**No Next button on this entry point.** The way forward is Continue on the
chosen row, because *which* draft is the question the step is asking. Hidden
rather than disabled: a disabled primary button reads as "you have not finished
this step", which is the wrong story when the step is finished by the control
beside it.

**Steps 1 and 2 stay reachable after resuming.** Resuming sets the furthest
step to 3, so someone who wants to look at the parsed BoM can step back.
Leaving it at 1 would strand them on step 3.

**BoM Options and Assembly Details are hidden on this entry point** rather than
shown inert. Both configure a BoM, and a resumed draft's BoM was configured
when it was saved; leaving them would invite the user to set a template for a
run that will not read it.

## Verified end to end

Import New BoM → assembly `ASSY-9001` rev `C`, "Controller board" → step 2 →
Confirm & Continue → step 3 → **Save draft**. Both toasts fire: the guideline's
verbatim *"Save draft quotation successfully!"* and ours naming where it went.

Wizard closed entirely, reopened, `Continue from drafts` selected. The row
reads `Continue · ASSY-9001 · C · Controller board · 1 · 1 · 30 Aug 2026 ·
12:14`. Continue lands on **3 - Quoting** with the assembly, description and 24
BoM lines restored; steps 1 and 2 show complete, step 4 not yet reached.

Empty state confirmed on a customer with no drafts. Step-1 validation still
fires for the other two entry points — `Please input information for partDesc`,
now on the error toast rather than the green one.

## Not in scope, and why

**`PR - NC - Resume Draft Quote` (§5497–6191) is 100% identical** to this
section, line for line. So are the other NC sections: `NC - Quick Quote` is
identical to its EC counterpart, and `NC - Create PR` differs by 4%, that 4%
being exactly the new-customer path already built in Package 4. On the
document's own evidence there is no remaining NC work — worth confirming with
the customer rather than assuming.

**"The BOM File field is blank when the quotation is run from an existing
BOM"** (§2942) sits in the Standard Quote section, not this one, and concerns
the Quotation Result row after submit.
