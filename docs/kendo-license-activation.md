# KendoReact — how licensing and activation work

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
