import { Conversation, Message, StatusLine } from '../ui/Conversation';
import type { Example } from './types';

/**
 * The Conversation page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/conversation.md`. The first matters most on
 * exactly the records where a thread is hardest to read — one that has been
 * through six states — and the two cards show six states' worth of the
 * difference in one glance.
 */
export const examples: Example[] = [
  {
    title: 'A status change is not something anyone said',
    note: 'A small grey line. No avatar, no name.',
    compare: [
      {
        verdict: 'do',
        caption: 'Two people spoke and four things happened. The thread reads as a conversation with events in it.',
        render: () => (
          <Conversation>
            <Message author="Linh Tran" time="12 Nov, 09:14">
              Customer asked for a revised lead time on the harness.
            </Message>
            <StatusLine>Status changed to In-Progress</StatusLine>
            <StatusLine>Assigned to Toan Dinh</StatusLine>
            <StatusLine>Priority raised to High</StatusLine>
            <Message author="Toan Dinh" time="12 Nov, 11:02">
              Quoted 12 days. Waiting on the connector.
            </Message>
            <StatusLine>Status changed to Quoted</StatusLine>
          </Conversation>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Every event given a face and a name. The record looks like six people discussing it, and the two messages that matter are lost among them.',
        render: () => (
          <Conversation>
            <Message author="Linh Tran" time="12 Nov, 09:14">
              Customer asked for a revised lead time on the harness.
            </Message>
            <Message author="System" time="12 Nov, 09:15">Status changed to In-Progress</Message>
            <Message author="System" time="12 Nov, 09:20">Assigned to Toan Dinh</Message>
            <Message author="System" time="12 Nov, 10:41">Priority raised to High</Message>
            <Message author="Toan Dinh" time="12 Nov, 11:02">
              Quoted 12 days. Waiting on the connector.
            </Message>
            <Message author="System" time="12 Nov, 11:03">Status changed to Quoted</Message>
          </Conversation>
        ),
      },
    ],
  },
  {
    title: 'Outside is a warning, not an error',
    note: 'Nothing is wrong. There is something to check before replying.',
    compare: [
      {
        verdict: 'do',
        caption: 'The tag says who you are about to reply to. An amber tag is a thing to notice, which is all this is.',
        render: () => (
          <Conversation>
            <Message author="Peter Nilsson" time="13 Nov, 08:30" outside
                     email={{ to: 'linh.tran@rocket.example', subject: 'RE: Lead time on 0455-118' }}>
              Can you confirm the 12 day figure in writing?
            </Message>
          </Conversation>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A red tag says the message should not have arrived, and the reader treats a customer email as an incident. Drawn by hand — the component has one tint.',
        render: () => (
          <Conversation>
            <Message author="Peter Nilsson" time="13 Nov, 08:30"
                     email={{ to: 'linh.tran@rocket.example', subject: 'RE: Lead time on 0455-118' }}>
              <span className="vy-msg-outside"
                    style={{ background: 'var(--vy-danger-subtle)', color: 'var(--vy-danger-text)' }}>
                Outside sender
              </span>
              <br />
              Can you confirm the 12 day figure in writing?
            </Message>
          </Conversation>
        ),
      },
    ],
  },
];
