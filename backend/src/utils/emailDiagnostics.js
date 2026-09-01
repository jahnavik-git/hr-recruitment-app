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
  const { emailUserPresent, emailPasswordPresent } = getEmailConfigStatus();

  if (!emailUserPresent || !emailPasswordPresent) {
    return { ok: false, reason: 'not-configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,
    secure: (process.env.EMAIL_PORT || '465') === '465',
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
