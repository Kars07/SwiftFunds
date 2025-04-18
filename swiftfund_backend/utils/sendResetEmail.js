const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
    const frontendUrl = "http://localhost:5173/reset-password"; 
    const resetLink = `${frontendUrl}?token=${token}`; 

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"SwiftFunds" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Link",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #007bff;">Password Reset</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a 
                    href="${resetLink}" 
                    style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;"
                >
                    Reset Password
                </a>
                <p>If the button above does not work, you can copy and paste the following link into your browser:</p>
                <p style="word-break: break-word;">${resetLink}</p>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>SwiftFunds Team</p>
            </div>
        `,
    });
};

module.exports = sendResetEmail;