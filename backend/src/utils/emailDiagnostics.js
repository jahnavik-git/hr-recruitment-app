import nodemailer from 'nodemailer';

// Safe, secret-free snapshot of the email configuration - never include the
// actual password value here.
export const getEmailConfigStatus = () => ({
  emailUserPresent: Boolean(process.env.EMAIL_USER),
  emailPasswordPresent: Boolean(process.env.EMAIL_PASSWORD),
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailFromName: process.env.EMAIL_FROM_NAME || 'HR Recruitment Team',
});

// Tests SMTP authentication only (no email is sent). Returns a safe result -
// on failure, Nodemailer/Google's error text describes the rejection reason
// but never contains the credential values themselves.
export const verifyEmailAuth = async () => {
  const { emailUserPresent, emailPasswordPresent, emailService } = getEmailConfigStatus();

  if (!emailUserPresent || !emailPasswordPresent) {
    return { ok: false, reason: 'not-configured' };
  }

  const transporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    family: 4,
  });

  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: 'auth-failed',
      code: error.code,
      responseCode: error.responseCode,
      message: error.message,
    };
  }
};
