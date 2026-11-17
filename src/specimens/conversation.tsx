import { Button } from '../ui/Button';
import { Conversation, Message, StatusLine } from '../ui/Conversation';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'A thread',
    note: 'Her shape. A status change is drawn as a grey line rather than a message, because nobody said it — giving it an avatar makes the thread look busier than the conversation was.',
    render: () => (
      <Conversation toolbar={<><Button size="sm">Send Message</Button> <Button variant="outlined" size="sm">New Email</Button></>}>
        <Message author="Quality Lead" time="03:20 PM">
          <p>@Adam Smith please add the coating area.</p>
        </Message>
        <StatusLine>Status changed to In Progress · 03:10 PM</StatusLine>
        <Message author="Adam Smith" time="03:02 PM"
                 email={{ to: 'buyer@example.com', subject: 'Quotation Q-2026-0331' }}>
          <p>Please find the quotation attached.</p>
        </Message>
      </Conversation>
    ),
  },
  {
    title: 'An outside sender',
    note: 'A warning, not an error: nothing is wrong, there is something to check before replying.',
    render: () => (
      <Conversation>
        <Message author="Maria Chen" time="11:40 AM" outside
                 email={{ to: 'sales@example.com', subject: 'RE: RFQ 00455' }}>
          <p>Can you confirm the lead time on the connectors?</p>
        </Message>
      </Conversation>
    ),
  },
  {
    title: 'Notes',
    note: 'She specifies Notes as "As Conversation", with Add Note above the list. One component, because the day the two drift is the day a user has to learn two reading patterns for the same thing.',
    render: () => (
      <Conversation toolbar={<Button variant="outlined" size="sm">Add Note</Button>}>
        <Message author="Buyer User" time="10/02/2026">
          <p>Customer wants the first 100 by 10/30/2026.</p>
        </Message>
      </Conversation>
    ),
  },
];
