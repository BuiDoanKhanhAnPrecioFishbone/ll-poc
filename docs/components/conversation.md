# Conversation

A thread of messages, emails and status changes. The BA specifies **Notes** as
*"As Conversation"*, so this is one component for both.

<!-- ds:tab examples -->

<!-- ds:specimen conversation -->

<!-- ds:tab usage -->

<!-- ds:specimen conversation-usage -->

## One shape for messages and notes

Her spec gives Notes no look of its own — only *Add Note above the list on the
left*. Building two components would guarantee they drift, and the day they
drift is the day a user has to learn two reading patterns for the same thing.

## Three kinds of entry

| | |
|---|---|
| **Message** | Someone wrote it. Avatar, name, time, body |
| **Email** | The same, with To and Subject above the body |
| **Status change** | A small grey line. **No avatar, no name** |

A status change is not something anyone said. Giving it an avatar makes a
thread look busier than the conversation actually was, which matters on a
record that has been through six states.

## The outside-sender tag

Her **warning** tint, and that is the right family: nothing is wrong, there is
something to check before replying. An error tint here would say the message
should not have arrived.

## When to use

- The activity, notes or correspondence on a record.

## When not to use

- **A system audit log.** Those are timestamps and field names, not
  conversation; they belong in a table that can be filtered.
- **A single comment.** One message with an avatar is a quote, not a thread.

## Accessibility

Each entry is an `<article>`, so a screen reader can step between them. The
avatar is `aria-hidden`: the name is right beside it, and initials read aloud
are noise.

<!-- ds:tab code -->

```tsx
<Conversation toolbar={<Button>Send Message</Button>}>
  <Message author="Quality Lead" time="03:20 PM">…</Message>
  <StatusLine>Status changed to In Progress · 03:10 PM</StatusLine>
  <Message author="Adam Smith" time="03:02 PM"
           email={{ to: 'buyer@example.com', subject: 'Quotation Q-2026-0331' }}>…</Message>
</Conversation>
```

`Avatar` renders `vy-avatar`, which this system already had and five files
already use — this is the first shared component for it. A rule for it was
briefly written here and deleted: `app.css` loads later, so the new rule was
silently overridden and the avatar kept its old colour while looking restyled.
Its ink is now her `primary-text`, fixed where the class actually lives.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: 2 Do/Don't card pairs, from rules already on this page. Live components, so a card cannot go stale against a token change |
| 17 Nov 2026 | This component and this page. The avatar also moved to her `primary-text` — 7.04:1 on the circle, where the old ink was 10.70 |
