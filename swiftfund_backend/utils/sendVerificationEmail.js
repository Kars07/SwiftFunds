const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {

  const backendUrl = process.env.BASE_URL; 
  const verificationLink = `${backendUrl}/api/users/verify/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SwiftFund" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification for SwiftFund",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #007bff;">Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for signing up with SwiftFund. Please click the button below to verify your email address:</p>
        <a 
          href="${verificationLink}" 
          style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;"
        >
          Verify Email
        </a>
        <p>If the button above does not work, you can copy and paste the following link into your browser:</p>
        <p style="word-break: break-word;">${verificationLink}</p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Best regards,<br>SwiftFund Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
