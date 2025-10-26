import express from "express";
import { sendOtpEmail } from "../services/otpService.js";

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    await sendOtpEmail(email, otp);
    console.log("email:"+email+" otp:"+otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

export default router;
