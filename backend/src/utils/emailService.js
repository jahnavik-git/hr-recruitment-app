import { Resend } from 'resend';
import { escapeHtml, htmlToPlainText } from './emailContent.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html, attachments }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('[mock-email]', JSON.stringify({ to, subject }));
    return { delivered: false, mode: 'mock', message: { to, subject } };
  }

  try {
    const resendAttachments = attachments?.map((a) => ({
      path: a.path,
      filename: a.filename || a.path?.split('/').pop(),
    }));

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'HR Team <onboarding@resend.dev>',
      to,
      subject,
      text: htmlToPlainText(html),
      html,
      attachments: resendAttachments,
    });

    if (error) throw new Error(error.message || 'Resend send failed');

    console.log('[email-sent]', to, subject, data?.id);
    return { delivered: true, mode: 'sent', messageId: data?.id };
  } catch (err) {
    console.error('[email-failed]', to, subject, err.message);
    return { delivered: false, mode: 'error', error: err.message };
  }
};

export const sendOfferEmail = async ({ to, candidateName, offer, attachmentPath }) => {
  const jobTitle = offer?.jobId?.jobTitle || 'the position';

  const html = `
    <p>Dear ${escapeHtml(candidateName)},</p>
    <p>Congratulations! We are pleased to offer you the position of <strong>${escapeHtml(jobTitle)}</strong>.</p>
    <p>Please find your offer letter attached. Let us know if you have any questions.</p>
    <p>Best regards,<br/>HR Recruitment Team</p>
  `;

  return sendMail({
    to,
    subject: `Offer Letter - ${jobTitle}`,
    html,
    attachments: attachmentPath ? [{ path: attachmentPath }] : undefined,
  });
};

export const sendSelectionEmail = async (candidate) => {
  const candidateName = escapeHtml(`${candidate.firstName} ${candidate.lastName}`);
  const html = `
    <p>Dear ${candidateName},</p>
    <p>Great news — you have been selected to move forward in our hiring process. Our team will be in touch shortly with next steps.</p>
    <p>Best regards,<br/>HR Recruitment Team</p>
  `;

  return sendMail({ to: candidate.email, subject: 'You have been selected', html });
};

export const sendRejectionEmail = async (candidate) => {
  const candidateName = escapeHtml(`${candidate.firstName} ${candidate.lastName}`);
  const html = `
    <p>Dear ${candidateName},</p>
    <p>Thank you for taking the time to apply and interview with us. After careful consideration, we have decided to move forward with other candidates at this time.</p>
    <p>We appreciate your interest and wish you the best in your search.</p>
    <p>Best regards,<br/>HR Recruitment Team</p>
  `;

  return sendMail({ to: candidate.email, subject: 'Application Update', html });
};

export const sendInterviewInvitationEmail = async ({ candidate, job, interview }) => {
  const candidateName = `${candidate.firstName} ${candidate.lastName}`;
  const jobTitle = job?.jobTitle || 'the position';

  const dateStr = interview.interviewDate
    ? new Date(interview.interviewDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';

  const timeStr = interview.startTime
    ? `${interview.startTime}${interview.endTime ? ' - ' + interview.endTime : ''}`
    : '';

  const meetingLink = escapeHtml(interview.meetingLink || '');
  const whereLine = interview.meetingLink
    ? `<p><strong>Meeting link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>`
    : interview.location
    ? `<p><strong>Location:</strong> ${escapeHtml(interview.location)}</p>`
    : '';

  const html = `
    <p>Dear ${escapeHtml(candidateName)},</p>
    <p>We are pleased to invite you for an interview for the position of <strong>${escapeHtml(jobTitle)}</strong>.</p>
    <p><strong>Interview type:</strong> ${escapeHtml(interview.interviewType || 'N/A')}</p>
    <p><strong>Date:</strong> ${dateStr}</p>
    ${timeStr ? `<p><strong>Time:</strong> ${escapeHtml(timeStr)}</p>` : ''}
    ${whereLine}
    ${interview.interviewer ? `<p><strong>Interviewer:</strong> ${escapeHtml(interview.interviewer)}</p>` : ''}
    ${interview.notes ? `<p><strong>Notes:</strong> ${escapeHtml(interview.notes)}</p>` : ''}
    <p>Please reply to confirm your availability. We look forward to speaking with you.</p>
    <p>Best regards,<br/>HR Recruitment Team</p>
  `;

  return sendMail({
    to: candidate.email,
    subject: `Interview Invitation - ${jobTitle}`,
    html,
  });
};

export const sendInterviewReminderEmail = async ({ candidate, job, interview }) => {
  const candidateName = `${candidate.firstName} ${candidate.lastName}`;
  const jobTitle = job?.jobTitle || 'the position';

  const dateStr = interview.interviewDate
    ? new Date(interview.interviewDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';

  const meetingLink = escapeHtml(interview.meetingLink || '');

  const html = `
    <p>Dear ${escapeHtml(candidateName)},</p>
    <p>This is a friendly reminder about your upcoming interview for <strong>${escapeHtml(jobTitle)}</strong> on <strong>${dateStr}</strong>${interview.startTime ? ` at ${escapeHtml(interview.startTime)}` : ''}.</p>
    ${interview.meetingLink ? `<p><strong>Meeting link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
    ${interview.location ? `<p><strong>Location:</strong> ${escapeHtml(interview.location)}</p>` : ''}
    <p>See you soon!</p>
    <p>Best regards,<br/>HR Recruitment Team</p>
  `;

  return sendMail({
    to: candidate.email,
    subject: `Reminder: Interview for ${jobTitle}`,
    html,
  });
};
