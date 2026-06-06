/* LangPath — Worker Job Status Constants */
window.LangPathConstants = window.LangPathConstants || {};

window.JOB_STATUSES = {
  PENDING:   'PENDING',
  RUNNING:   'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  CANCELLED: 'CANCELLED',
};

window.JOB_STATUS_COLORS = {
  PENDING:   'gray',
  RUNNING:   'blue',
  COMPLETED: 'green',
  FAILED:    'red',
  CANCELLED: 'amber',
};

window.LangPathConstants.JOB_STATUSES      = window.JOB_STATUSES;
window.LangPathConstants.JOB_STATUS_COLORS = window.JOB_STATUS_COLORS;
