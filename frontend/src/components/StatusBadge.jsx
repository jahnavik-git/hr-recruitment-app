const STATUS_BADGE_VARIANTS = {
  // Jobs
  Draft: 'secondary',
  Active: 'success',
  Paused: 'warning',
  Closed: 'dark',
  // Onboarding / assessments
  Pending: 'secondary',
  'Documents Pending': 'warning',
  'In Progress': 'info',
  Completed: 'success',
  // Candidate pipeline
  New: 'info',
  Screening: 'secondary',
  Shortlisted: 'primary',
  Assessment: 'warning',
  'Interview Scheduled': 'info',
  'Interview Completed': 'primary',
  Selected: 'success',
  'Offer Draft': 'secondary',
  'Offer Sent': 'warning',
  'Offer Accepted': 'success',
  Hired: 'success',
  Rejected: 'danger',
  // Offers
  Sent: 'warning',
  Accepted: 'success',
  Declined: 'danger',
  Expired: 'dark',
  // Interviews
  Scheduled: 'info',
  Cancelled: 'danger',
  Rescheduled: 'warning',
  'No Show': 'danger',
};

const StatusBadge = ({ status }) => {
  const variant = STATUS_BADGE_VARIANTS[status] || 'secondary';

  return <span className={`badge rounded-pill bg-${variant}`}>{status}</span>;
};

export default StatusBadge;
