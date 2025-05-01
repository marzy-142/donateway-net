import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'robert.cremin@ethereal.email',
    pass: 'KB64E48m1QYf8CZYx2'
  }
});

export const emailService = {
  async sendReferralNotification({
    to,
    donorName,
    recipientName,
    hospitalName,
    bloodType,
    urgencyLevel,
    appointmentDate,
    additionalNotes
  }: {
    to: string;
    donorName: string;
    recipientName: string;
    hospitalName: string;
    bloodType: string;
    urgencyLevel: string;
    appointmentDate: string;
    additionalNotes?: string;
  }) {
    const mailOptions = {
      from: '"DonateWay" <hello@example.com>',
      to,
      subject: 'New Blood Donation Referral',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">New Blood Donation Referral</h2>
          <p>A new blood donation referral has been created.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4b5563; margin-top: 0;">Referral Details</h3>
            <p><strong>Donor:</strong> ${donorName}</p>
            <p><strong>Recipient:</strong> ${recipientName}</p>
            <p><strong>Hospital:</strong> ${hospitalName}</p>
            <p><strong>Blood Type Needed:</strong> ${bloodType}</p>
            <p><strong>Urgency Level:</strong> ${urgencyLevel}</p>
            <p><strong>Preferred Appointment Date:</strong> ${appointmentDate}</p>
            ${additionalNotes ? `<p><strong>Additional Notes:</strong> ${additionalNotes}</p>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Please log in to your DonateWay account to respond to this referral.
          </p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
};
