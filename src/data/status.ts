/* =============================================================================
   STATUS VOCABULARY
   -----------------------------------------------------------------------------
   Six tokens. Every module maps its own lifecycle onto them, so "what state is
   this record in" is answered the same way in Quotations, Sales Orders, Work
   Orders and the Part Master.

   Lifecycle values below are the real ones observed in the live system:
     Quotations   New / In-Progress / Quoted / Completed / Cancelled
     Sales Orders Open / Released
     Part Master  Active / Inactive / Obsolete / Pending
   ========================================================================== */

export type StatusToken = 'draft' | 'open' | 'progress' | 'done' | 'blocked' | 'cancelled';

export const STATUS_TOKEN: Record<string, StatusToken> = {
  Draft: 'draft', Pending: 'draft',
  New: 'open', Open: 'open', Quoted: 'open',
  'In-Progress': 'progress', Partial: 'progress',
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
  done: 'success',
  blocked: 'error',
  cancelled: 'secondary',
};
