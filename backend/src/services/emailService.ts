import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendBookingEmail = async (
  customerName: string,
  email: string,
  appointmentDetails: { date: string; time: string; service_type: string }
): Promise<void> => {
  const subject = 'Terminbestätigung - Entrümpelungsservice';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Vielen Dank für Ihre Buchung!</h2>
      <p>Liebe/r ${customerName},</p>
      <p>Wir freuen uns auf Ihren Termin. Hier sind die Details:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Dienstleistung:</strong> ${appointmentDetails.service_type}</p>
        <p><strong>Datum:</strong> ${new Date(appointmentDetails.date).toLocaleDateString('de-DE')}</p>
        <p><strong>Uhrzeit:</strong> ${appointmentDetails.time} Uhr</p>
      </div>
      <p>Falls Sie Fragen haben oder den Termin verschieben möchten, kontaktieren Sie uns bitte.</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Entrümpelungsservice Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });
    console.log(`✅ Booking email sent to ${email}`);
  } catch (error) {
    console.error('Error sending booking email:', error);
    // Don't throw - don't block appointment creation if email fails
  }
};

export const sendConfirmationEmail = async (
  adminEmail: string,
  appointmentDetails: { name: string; email: string; date: string; time: string; service_type: string }
): Promise<void> => {
  const subject = `Neue Buchung: ${appointmentDetails.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Neue Terminbuchung</h2>
      <p><strong>Kunde:</strong> ${appointmentDetails.name}</p>
      <p><strong>E-Mail:</strong> ${appointmentDetails.email}</p>
      <p><strong>Dienstleistung:</strong> ${appointmentDetails.service_type}</p>
      <p><strong>Datum:</strong> ${new Date(appointmentDetails.date).toLocaleDateString('de-DE')}</p>
      <p><strong>Uhrzeit:</strong> ${appointmentDetails.time} Uhr</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject,
      html,
    });
    console.log(`✅ Admin notification sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};
