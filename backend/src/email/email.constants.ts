/** BullMQ queue for transactional email jobs. */
export const EMAIL_QUEUE = 'email';

/** Job type: order placed → send confirmation email. */
export const ORDER_CONFIRMATION_JOB = 'order-confirmation';

export const EMAIL_QUEUE_DEFAULT_ATTEMPTS = 5;
export const EMAIL_QUEUE_BACKOFF_DELAY_MS = 3_000;
