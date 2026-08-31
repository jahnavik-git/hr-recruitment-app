import Job from '../models/Job.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// closingDate is stored as UTC midnight of the picked calendar date (date-only picker),
// so a job stays Active through the entire closing day and only expires once that day
// has fully elapsed (now >= closingDate + 1 day).
const isClosingDateExpired = (closingDate, now = new Date()) => {
  if (!closingDate) return false;
  const closing = new Date(closingDate);
  if (Number.isNaN(closing.getTime())) return false;
  return now.getTime() >= closing.getTime() + MS_PER_DAY;
};

// Only ever downgrades Active -> Closed on expiry; never auto-activates
// Draft/Paused/Closed jobs based on closingDate.
export const deriveJobStatus = (status, closingDate, now = new Date()) =>
  status === 'Active' && isClosingDateExpired(closingDate, now) ? 'Closed' : status;

export const closeExpiredJobs = async () => {
  const cutoff = new Date(Date.now() - MS_PER_DAY);

  await Job.updateMany(
    {
      status: 'Active',
      closingDate: { $exists: true, $ne: null, $lte: cutoff },
    },
    { $set: { status: 'Closed' } }
  );
};
