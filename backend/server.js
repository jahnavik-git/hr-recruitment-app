import app from './src/app.js';
import env from './src/config/env.js';
import connectDB from './src/config/database.js';
import seedAdmin from './src/utils/seedAdmin.js';
import { getEmailConfigStatus, verifyEmailAuth } from './src/utils/emailDiagnostics.js';

const startServer = async () => {
  await connectDB();
  await seedAdmin();

 const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`API URL: http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });

  const emailStatus = getEmailConfigStatus();
  console.log(
    `Email config - user present: ${emailStatus.emailUserPresent}, password present: ${emailStatus.emailPasswordPresent}, service: ${emailStatus.emailService}, from name: ${emailStatus.emailFromName}`
  );
  if (emailStatus.emailUserPresent && emailStatus.emailPasswordPresent) {
    verifyEmailAuth().then((result) => {
      if (result.ok) {
        console.log('Email SMTP auth check: OK');
      } else if (result.reason === 'auth-failed') {
        console.error(
          `Email SMTP auth check: FAILED (code: ${result.code}, responseCode: ${result.responseCode}) - ${result.message}`
        );
      }
    });
  }

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
