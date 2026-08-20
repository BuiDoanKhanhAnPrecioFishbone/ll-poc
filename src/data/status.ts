/* =============================================================================
   STATUS VOCABULARY
   -----------------------------------------------------------------------------
   Seven tokens. Every module maps its own lifecycle onto them, so "what state
   is this record in" is answered the same way in Quotations, Sales Orders, Work
   Orders and the Part Master.

   Lifecycle values below are the real ones observed in the live system:
     Quotations   New / In-Progress / Quoted / Completed / Cancelled
     Sales Orders Open / Released
     Part Master  Active / Inactive / Obsolete / Pending
   ========================================================================== */

export type StatusToken = 'draft' | 'open' | 'progress' | 'waiting' | 'done' | 'blocked' | 'cancelled';

/*
 * Seven tokens, not six. `waiting` was added after the Quotations screen showed
 * why six is one short: an RFQ that is New (nobody has picked it up) and one
 * that is Quoted (sent, awaiting the customer) are opposite states — one needs
 * you today, one does not — yet both collapsed onto `open` and rendered the
 * same amber. Two distinct states sharing a colour is the same defect the
 * production Part Master has, where every status is green.
 *
 * The distinction the tokens encode is WHO IS BLOCKED, not what stage a record
 * is at:
 *   draft     nothing has happened yet
 *   open      waiting on US — this is what a work queue filters to
 *   progress  actively being worked by us
 *   waiting   waiting on SOMEONE ELSE — a customer, a supplier, an approver
 *   done      closed successfully
 *   blocked   stopped and needs intervention
 *   cancelled closed without completing
 */
export const STATUS_TOKEN: Record<string, StatusToken> = {
  Draft: 'draft', Pending: 'draft',
  New: 'open', Open: 'open',
  'In-Progress': 'progress', Partial: 'progress',
  Quoted: 'waiting', Submitted: 'waiting', 'Awaiting Approval': 'waiting',
  Active: 'done', Released: 'done', Completed: 'done', Paid: 'done',
  Inactive: 'cancelled', Cancelled: 'cancelled', Closed: 'cancelled',
  Obsolete: 'blocked', Blocked: 'blocked', Overdue: 'blocked',
};

/**
 * Kendo Badge themeColor per token, so the badge stays a stock component.
 * The union Badge accepts in v16 is base | primary | secondary | tertiary |
 * info | success | warning | error — there is no 'dark'.
 */
export type BadgeTheme = 'base' | 'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';

export const STATUS_THEME: Record<StatusToken, BadgeTheme> = {
  draft: 'base',
  open: 'warning',
  progress: 'info',
  waiting: 'tertiary',
  done: 'success',
  blocked: 'error',
  cancelled: 'secondary',
};
