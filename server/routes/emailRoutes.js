// routes/emailRoutes.js
import express from "express";
import { sendReminderEmail, sendReplyEmail } from "../services/emailService.js";

const router = express.Router();

// Endpoint to send membership expiry reminder
router.post("/send-reminder", async (req, res) => {
  try {
    const { email, userName, packageName, daysRemaining, endDate, message } = req.body;

    // Validate required fields
    if (!email || !userName || !packageName || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Send reminder email using Mailjet
    await sendReminderEmail(
      email,
      userName,
      packageName,
      daysRemaining,
      endDate,
      message
    );

    res.status(200).json({
      success: true,
      message: "Reminder email sent successfully",
    });
  } catch (error) {
    console.error("Error in send-reminder endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reminder email",
      error: error.message,
    });
  }
});

// Endpoint to send reply to contact message
router.post("/send-reply", async (req, res) => {
  try {
    const { email, userName, userSubject, userMessage, adminReply } = req.body;

    // Validate required fields
    if (!email || !userName || !adminReply) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Send reply email using Mailjet
    await sendReplyEmail(
      email,
      userName,
      userSubject,
      userMessage,
      adminReply
    );

    res.status(200).json({
      success: true,
      message: "Reply email sent successfully",
    });
  } catch (error) {
    console.error("Error in send-reply endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply email",
      error: error.message,
    });
  }
});

export default router;