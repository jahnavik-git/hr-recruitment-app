import Candidate from '../models/Candidate.js';
import EmailHistory from '../models/EmailHistory.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { createActivity } from '../utils/activityService.js';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const getDisplayCandidateName = (candidate) => {
  if (!candidate) return '';
  return [candidate.firstName, candidate.lastName].filter(Boolean).join(' ').trim();
};

const RECORD_STATUSES = ['Draft', 'Downloaded'];

// This ATS does not send emails itself. This endpoint records that a
// recruiter prepared an email draft (and, if applicable, downloaded it as an
// .eml file) so the candidate's email history reflects what actually
// happened - it never claims the email was delivered.
export const createCandidateEmailRecord = asyncHandler(async (req, res) => {
  const { candidateId, to, subject, message, template, status } = req.body;

  if (!candidateId) {
    throw new ApiError(400, 'Candidate is required');
  }

  const candidate = await Candidate.findById(candidateId).populate('appliedJob', 'jobTitle');
  if (!candidate) {
    throw new ApiError(404, 'Candidate not found');
  }

  if (!candidate.email) {
    throw new ApiError(400, 'This candidate does not have an email address.');
  }

  const recipient = (to || candidate.email || '').trim();
  if (!recipient || !validateEmail(recipient)) {
    throw new ApiError(400, 'Recipient email is invalid');
  }

  if (!subject || !String(subject).trim()) {
    throw new ApiError(400, 'Email subject is required');
  }

  if (!message || !String(message).trim()) {
    throw new ApiError(400, 'Email message is required');
  }

  const safeTemplate = template || 'Custom Email';
  const recordStatus = RECORD_STATUSES.includes(status) ? status : 'Draft';

  const history = await EmailHistory.create({
    candidateId: candidate._id,
    candidateName: getDisplayCandidateName(candidate),
    candidateEmail: candidate.email,
    subject: String(subject).trim(),
    template: safeTemplate,
    message: String(message).trim(),
    sentBy: req.user?._id,
    status: recordStatus,
  });

  await createActivity({
    candidateId: candidate._id,
    type: recordStatus === 'Downloaded' ? 'EMAIL_DOWNLOADED' : 'EMAIL_DRAFT_CREATED',
    title: recordStatus === 'Downloaded' ? 'Email Downloaded' : 'Email Draft Created',
    description: `Email ${recordStatus === 'Downloaded' ? 'downloaded' : 'drafted'} for ${recipient} with subject: ${subject}`,
    performedBy: req.user?._id,
    metadata: {
      recipient,
      subject,
      template: safeTemplate,
      emailHistoryId: history._id,
    },
  });

  res.status(200).json({
    success: true,
    status: recordStatus,
    message: recordStatus === 'Downloaded' ? 'Email file downloaded.' : 'Email draft created.',
    data: { history },
  });
});

export const getCandidateEmailHistory = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new ApiError(404, 'Candidate not found');
  }

  const history = await EmailHistory.find({ candidateId })
    .populate('sentBy', 'firstName lastName role')
    .sort({ sentAt: -1 });

  res.status(200).json({
    success: true,
    data: { history },
  });
});
