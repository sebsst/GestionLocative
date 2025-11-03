import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter based on user settings or default env variables
const createTransporter = (user = null) => {
  if (user?.emailConfigured) {
    return nodemailer.createTransport({
      host: user.emailSmtpHost,
      port: user.emailSmtpPort,
      secure: user.emailSmtpSecure,
      auth: {
        user: user.emailSmtpUser,
        pass: user.emailSmtpPass
      }
    });
  }

  // Fallback to default environment variables
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendEmail = async ({ to, subject, text, html, attachments, user = null }) => {
  try {
    const transporter = createTransporter(user);

    const fromEmail = user?.emailFrom || process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendRentReminder = async (tenant, lease, rent, user = null) => {
  const subject = 'Rappel de paiement de loyer';
  const html = `
    <h2>Rappel de paiement de loyer</h2>
    <p>Bonjour ${tenant.firstName} ${tenant.lastName},</p>
    <p>Nous vous rappelons que le loyer du mois ${rent.month}/${rent.year} est en attente de paiement.</p>
    <p><strong>Montant attendu:</strong> ${rent.expectedAmount} €</p>
    <p><strong>Montant payé:</strong> ${rent.paidAmount} €</p>
    <p><strong>Reste à payer:</strong> ${parseFloat(rent.expectedAmount) - parseFloat(rent.paidAmount)} €</p>
    <p>Merci de régulariser votre situation dans les plus brefs délais.</p>
    <p>Cordialement,</p>
    <p>Votre gestionnaire</p>
  `;

  return await sendEmail({
    to: tenant.email,
    subject,
    html,
    user
  });
};

export const sendLateRentNotice = async (tenant, lease, rent, user = null) => {
  const subject = 'Mise en demeure - Loyer impayé';
  const html = `
    <h2>Mise en demeure</h2>
    <p>Madame, Monsieur ${tenant.lastName},</p>
    <p>Nous constatons que le loyer du mois ${rent.month}/${rent.year} n'a pas été réglé.</p>
    <p><strong>Montant dû:</strong> ${parseFloat(rent.expectedAmount) - parseFloat(rent.paidAmount)} €</p>
    <p>Nous vous prions de bien vouloir régulariser cette situation sous 8 jours, faute de quoi nous serions dans l'obligation d'engager des poursuites.</p>
    <p>Cordialement,</p>
    <p>Votre gestionnaire</p>
  `;

  return await sendEmail({
    to: tenant.email,
    subject,
    html,
    user
  });
};

export const sendLeaseDocument = async (tenant, lease, pdfBuffer, user = null) => {
  const subject = 'Votre contrat de location';
  const html = `
    <h2>Contrat de location</h2>
    <p>Bonjour ${tenant.firstName} ${tenant.lastName},</p>
    <p>Vous trouverez ci-joint votre contrat de location.</p>
    <p>Cordialement,</p>
    <p>Votre gestionnaire</p>
  `;

  return await sendEmail({
    to: tenant.email,
    subject,
    html,
    attachments: [
      {
        filename: 'contrat-location.pdf',
        content: pdfBuffer
      }
    ],
    user
  });
};

export default {
  sendEmail,
  sendRentReminder,
  sendLateRentNotice,
  sendLeaseDocument
};
