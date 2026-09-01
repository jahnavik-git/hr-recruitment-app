export const getEmailConfigStatus = () => ({
  emailUserPresent: Boolean(process.env.RESEND_API_KEY),
  emailPasswordPresent: Boolean(process.env.RESEND_API_KEY),
  emailService: 'resend',
  emailFromName: process.env.EMAIL_FROM || 'HR Team <onboarding@resend.dev>',
});

export const verifyEmailAuth = async () => {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, reason: 'not-configured' };
  }
  return { ok: true };
};
