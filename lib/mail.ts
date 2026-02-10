import nodemailer from "nodemailer";
import {
  passwordResetTemplate,
  twoFactorTokenTemplate,
  verificationTemplate,
} from "./email-templates/authentication";
import { collaboratorVerificationTemplate } from "./email-templates/collaborator";

const domain = process.env.NEXT_PUBLIC_APP_URL;

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const baseMessage = {
  from: process.env.EMAIL_FROM,
  headers: {
    "X-Entity-Ref-ID": "newmail",
  },
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  console.log("sendTwoFactorTokenEmail called");

  const transporter = createTransporter();

  try {
    await transporter.verify();
    console.log("SMTP connected");

    const message = {
      ...baseMessage,
      to: email,
      subject: "2FA Code",
      html: twoFactorTokenTemplate(token),
    };

    await transporter.sendMail(message);
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  console.log("sendTwoFactorTokenEmail called");

  const transporter = createTransporter();

  try {
    await transporter.verify();
    console.log("SMTP connected");

    const message = {
      ...baseMessage,
      to: email,
      subject: "Reset your password",
      html: passwordResetTemplate(resetLink),
    };

    await transporter.sendMail(message);
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  console.log("sendTwoFactorTokenEmail called");

  const transporter = createTransporter();

  try {
    await transporter.verify();
    console.log("SMTP connected");

    const message = {
      ...baseMessage,
      to: email,
      subject: "Confirm your email",
      html: verificationTemplate(confirmLink),
    };

    await transporter.sendMail(message);
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};

export const sendCollaboratorVerificationEmail = async (
  email: string,
  token: string,
) => {
  const confirmLink = `${domain}/verify/new-collaborator?token=${token}`;
  console.log("sendTwoFactorTokenEmail called");

  const transporter = createTransporter();

  try {
    await transporter.verify();
    console.log("SMTP connected");

    const message = {
      ...baseMessage,
      to: email,
      subject: "Confirm your collaborator request",
      html: collaboratorVerificationTemplate(confirmLink),
    };

    await transporter.sendMail(message);
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};
