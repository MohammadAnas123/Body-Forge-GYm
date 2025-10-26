// services/emailService.js
import dotenv from "dotenv";
import Mailjet from "node-mailjet";

dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// Function to send membership expiry reminder
export async function sendReminderEmail(
  toEmail,
  userName,
  packageName,
  daysRemaining,
  endDate,
  message
) {
  try {
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL,
            Name: process.env.MJ_SENDER_NAME,
          },
          To: [
            {
              Email: toEmail,
              Name: userName,
            },
          ],
          Subject: `⚠️ Membership Expiry Reminder - ${packageName}`,
          TextPart: `Dear ${userName},\n\n${message}\n\nPackage: ${packageName}\nExpires in: ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}\nExpiry Date: ${new Date(endDate).toLocaleDateString()}\n\nBest regards,\nGym Management Team`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">⚠️ Membership Expiry Reminder</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9fafb;">
                <p style="font-size: 16px; color: #374151;">Dear ${userName},</p>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-weight: bold;">
                    Your membership expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}!
                  </p>
                  <p style="margin: 5px 0 0 0; color: #92400e;">
                    Package: <strong>${packageName}</strong>
                  </p>
                  <p style="margin: 5px 0 0 0; color: #92400e;">
                    Expiry Date: <strong>${new Date(endDate).toLocaleDateString()}</strong>
                  </p>
                </div>
                
                <div style="white-space: pre-line; color: #4b5563; line-height: 1.6;">
                  ${message}
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background-color: white; border-radius: 8px; text-align: center;">
                  <p style="color: #6b7280; margin: 0;">To renew your membership, please visit our gym or contact us.</p>
                </div>
              </div>
              
              <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Gym Management System. All rights reserved.</p>
              </div>
            </div>
          `,
        },
      ],
    });

    const result = await request;
    console.log("✅ Reminder email sent:", JSON.stringify(result.body, null, 2));
    return result;
  } catch (err) {
    console.error("❌ Error sending reminder email:", err.message || err);
    throw err;
  }
}

// Function to send reply to contact message
export async function sendReplyEmail(
  toEmail,
  userName,
  userSubject,
  userMessage,
  adminReply
) {
  try {
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL,
            Name: process.env.MJ_SENDER_NAME,
          },
          To: [
            {
              Email: toEmail,
              Name: userName,
            },
          ],
          Subject: `Re: ${userSubject || 'Your Inquiry'}`,
          TextPart: `Dear ${userName},\n\nThank you for reaching out to us. Here's our response to your inquiry:\n\nYour Message:\n${userMessage}\n\nOur Response:\n${adminReply}\n\nIf you have any further questions, feel free to contact us.\n\nBest regards,\nGym Management Team`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">💬 Response to Your Message</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9fafb;">
                <p style="font-size: 16px; color: #374151;">Dear ${userName},</p>
                
                <p style="color: #6b7280;">Thank you for reaching out to us. Here's our response to your inquiry:</p>
                
                ${userMessage ? `
                  <div style="background-color: #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280; font-weight: bold;">YOUR MESSAGE:</p>
                    <p style="margin: 0; color: #374151; font-style: italic;">${userMessage}</p>
                  </div>
                ` : ''}
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; color: #3b82f6; font-weight: bold;">OUR RESPONSE:</p>
                  <div style="white-space: pre-line; color: #374151; line-height: 1.6;">
                    ${adminReply}
                  </div>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
                  <p style="color: #1e40af; margin: 0; font-size: 14px;">
                    If you have any further questions, feel free to contact us or visit our gym.
                  </p>
                </div>
              </div>
              
              <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Gym Management System. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">This is an automated response to your inquiry.</p>
              </div>
            </div>
          `,
        },
      ],
    });

    const result = await request;
    console.log("✅ Reply email sent:", JSON.stringify(result.body, null, 2));
    return result;
  } catch (err) {
    console.error("❌ Error sending reply email:", err.message || err);
    throw err;
  }
}