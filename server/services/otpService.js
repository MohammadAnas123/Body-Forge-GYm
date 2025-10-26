import dotenv from "dotenv";
import Mailjet from "node-mailjet";

// load env variables
dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

export async function sendOtpEmail(toEmail, otp) {
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
            },
          ],
          Subject: "Your OTP Code",
          TextPart: `Your OTP is ${otp}`,
        },
      ],
    });

  const result = await request;
  console.log("✅ Mail sent:", JSON.stringify(result.body, null, 2));
  } catch (err) {
    console.error("❌ Error sending email:", err.message || err);
    throw err;
  }
}
