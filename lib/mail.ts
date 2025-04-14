import nodemailer from "nodemailer";
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`,
    headers: {
      "X-Entity-Ref-ID": "newmail",
    },
  };

  await transporter.sendMail(message);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
    headers: {
      "X-Entity-Ref-ID": "newmail",
    },
  };

  await transporter.sendMail(message);
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
    headers: {
      "X-Entity-Ref-ID": "newmail",
    },
  };

  await transporter.sendMail(message);
};
