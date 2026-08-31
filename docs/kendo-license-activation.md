# KendoReact — how licensing and activation work

> **Update, 30 Aug 2026 — a licence key now exists.** The customer supplied one,
> and it is stored locally in `.env.local` as `TELERIK_LICENSE` (gitignored via
> `*.local`; it is not in the repository and must never be).
>
> **It activates nothing today.** This project installs no `@progress/*`
> packages, so there is no Kendo component to watermark and nothing that reads
> the variable. The key removes the *blocker* described in section 6 — it does
> not by itself change a single pixel. Section 7 covers deployment for when the
> migration is actually made.

Prepared for the client, 25 Aug 2026, in answer to:

> *"Tôi chưa hình dung việc activate license như thế nào. Về code thì các bạn có
> activate license để code thông qua npm không? Có tài liệu activate không?"*
>
> *"I can't picture how the licence activation works. For development, do you
> activate the licence through npm? Is there activation documentation?"*

Short answer: **yes, activation happens through npm, and it needs a licence key
that only the licence holder can generate.** Details below.

---

## 1. What is actually licensed

KendoReact is commercial software from Progress Telerik. The npm packages are
public — anyone can `npm install` them — but they are **not free to use**. The
licence is what makes using them lawful, and it is enforced in two places:

| Where | What happens without a licence |
|---|---|
| Development / build | A licence-key check runs at build time |
| The running app | A watermark and a console warning appear on Kendo components |

So an unlicensed build still *runs*. It is simply not shippable — the watermark
is visible to end users.

---

## 2. How activation works, step by step

### Step 1 — Someone buys a licence
A **KendoReact** subscription (or Telerik DevCraft, which includes it). Licences
are **per developer**, named, and annual. Every developer who writes or builds
code against Kendo needs a seat.

### Step 2 — The licence holder downloads a licence key
From their Telerik account: **telerik.com → Your Account → Manage Licence Keys →
Download Licence Key**. This produces a file, `telerik-license.txt`.

The key is tied to the account. **We cannot generate it — only the licence
holder can.**

### Step 3 — The key goes into the project
Two ways, and the second is the one that matters for a team:

**(a) A file in the project root**
```
telerik-license.txt
```
Never committed to git. It belongs in `.gitignore`.

**(b) An environment variable — the right way for CI and shared work**
```
KENDO_UI_LICENSE=<contents of telerik-license.txt>
```
This is how a build server, or a hosting platform such as Vercel, receives it:
as a secret environment variable, set once in the project settings.

### Step 4 — The activation script runs
The licence package is installed as a normal dependency:

```bash
npm install --save @progress/kendo-licensing
```

and activation runs as part of install:

```jsonc
// package.json
{
  "scripts": {
    "postinstall": "kendo-ui-license activate"
  }
}
```

`npm install` then triggers `postinstall`, which reads the key from
`telerik-license.txt` or `KENDO_UI_LICENSE`, validates it, and writes the
activation the build needs. Nothing else in the code changes.

### Step 5 — Verify
A successful run prints a confirmation. A failure prints a clear reason —
expired, wrong product, or key not found — and the build continues but the
watermark appears.

---

## 3. What this means practically

| Question | Answer |
|---|---|
| Is a licence needed just to write code? | **Yes.** Per developer, per year. |
| Is it needed to run the built app? | Yes — without it the app carries a visible watermark. |
| Can we activate it? | **No.** Only the licence holder can download the key. |
| Can one key cover the team? | One key file covers the *seats purchased*. Seats are per developer. |
| Does it work offline / in CI? | Yes — via the `KENDO_UI_LICENSE` environment variable. |
| Does the key expire? | Yes, annually. A build with an expired key falls back to the watermark. |
| Where does the key live? | Never in git. A local ignored file, or a secret in the build platform. |

---

## 4. What we need from you

To use KendoReact on this project, we need **one** of:

1. **A licence key file** — you download `telerik-license.txt` from your Telerik
   account and send it to us through a secure channel (not email, not chat).
   We set it as a secret environment variable on the build.

2. **Named developer seats** — you purchase seats for the developers on this
   project, who then generate their own keys from their own accounts.

If neither is available, we continue as we are now: **licence-free components**.
That is the current position and it is working — every functional requirement in
your review has been met without Kendo. The trade is implementation time, since
these components are written rather than bought.

---

## 5. Official documentation

- Licensing overview — https://www.telerik.com/kendo-react-ui/components/licensing/
- Installing the licence key — https://www.telerik.com/kendo-react-ui/components/licensing/license-key/
- CI and build servers — https://www.telerik.com/kendo-react-ui/components/licensing/license-key/#toc-ci-cd-environments
- Purchasing — https://www.telerik.com/purchase/kendo-ui

> These links are Progress Telerik's own documentation. **Please confirm the
> current terms and pricing directly with them** — licensing models change, and
> we are describing how activation works mechanically, not quoting commercial
> terms on their behalf.

---

## 6. A note on where the project stands

This prototype was originally scaffolded against KendoReact. When the licence
position became unclear it was rebuilt on **MIT-licensed components**, which
carry no licence obligation and no watermark.

That rebuild is done and working. Moving *back* to Kendo is possible but is not
a small change — it would replace the grid, dialogs, dropdowns, date inputs and
form controls. **It is worth deciding the licence question before that work is
scheduled, not after.**


---

## 7. Deployment (Vercel), for when Kendo is actually adopted

Nothing below has any effect until `@progress/kendo-react-*` packages are
installed. Recorded now so the key does not have to be found again.

### What to set in Vercel

**Project → Settings → Environment Variables**

| Field | Value |
|---|---|
| Key | `TELERIK_LICENSE` |
| Value | the licence key, pasted whole — it is one long line, no quotes, no line breaks |
| Environments | Production, Preview **and** Development |

Tick all three. The licence is checked **at build time**, and Vercel builds
preview deployments the same way it builds production — a key set only on
Production gives every pull-request preview a watermark.

Mark it **Sensitive** if the option is offered. It is a paid, per-developer
credential; it should not be readable back out of the dashboard by anyone who
can open the project.

### What must also be true

1. `@progress/kendo-licensing` installed as a dependency.
2. The activation step runs during build. Current Kendo reads `TELERIK_LICENSE`
   from the environment automatically during install/build; older versions need
   `npx kendo-ui-license activate` in a `postinstall` or in the build command.
   **Confirm which against the version actually installed** — this is the step
   most likely to have changed since this note was written.
3. `.env.local` stays out of git. It is covered by `*.local` in `.gitignore`;
   Vercel never reads it, which is exactly why the dashboard variable is needed.

### Verifying it worked

A licensed build has **no watermark on Kendo components and no licence warning
in the build log**. Check the Vercel build log for a Telerik licence line — an
unlicensed build says so there before anyone sees the page. Do not verify by
looking at production only; check a preview deployment too, since that is the
build most likely to be missing the variable.

### Rotation

The key is tied to the licence holder's Telerik account and expires with the
subscription. When it is renewed the Vercel variable has to be updated by hand —
nothing warns you, the watermark simply comes back.
