// Utility for sending WhatsApp messages using the Twilio API structure.
// If actual credentials are not provided, it will fallback to a simulated log.

/**
 * Sends a WhatsApp performance alert to a parent.
 * @param {Object} data - Alert data (parentPhone, studentName, subject, score, grade, title)
 */
const sendWhatsAppPerformanceAlert = async (data) => {
    const { parentPhone, studentName, subject, score, grade, title } = data;

    if (!parentPhone || parentPhone === 'N/A') {
        console.warn(`WhatsApp Service: No valid phone for student ${studentName}. Skipping notification.`);
        return;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

    // Format phone number to ensure it has international code if needed.
    // For this demonstration, we assume it's correctly formatted or provided as-is.
    const formattedPhone = parentPhone.startsWith('+') ? parentPhone : `+91${parentPhone}`; // Assuming +91 default for demo

    const messageBody = `📚 *Academic Update for ${studentName}*\n\n` +
        `New marks have been released for the assessment: *${title}*\n\n` +
        `📖 *Subject:* ${subject}\n` +
        `🎯 *Score:* ${score}%\n` +
        `✨ *Grade:* ${grade}\n\n` +
        `You can view the detailed breakdown and progress charts in your Parent Dashboard.\n\n` +
        `_(Automated message from the School CEO System)_`;

    // 1. Fallback / Simulation Mode if credentials are missing
    if (!accountSid || !authToken || accountSid === 'your_twilio_account_sid_here') {
        console.log(`\n================= WHATSAPP NOTIFICATION (SIMULATED) =================`);
        console.log(`To: whatsapp:${formattedPhone}`);
        console.log(`From: simulated_system`);
        console.log(`Message:\n${messageBody}`);
        console.log(`=====================================================================\n`);
        return { sid: `simulated_wa_${Date.now()}`, status: 'simulated' };
    }

    // 2. Actual API Call Mode (Requires 'twilio' npm package)
    try {
        const client = require('twilio')(accountSid, authToken);
        
        const messagePayload = {
            body: messageBody,
            to: `whatsapp:${formattedPhone}`
        };

        // Prefer Messaging Service SID if provided, otherwise fallback to the hardcoded WhatsApp from number
        if (messagingServiceSid) {
            messagePayload.messagingServiceSid = messagingServiceSid;
        } else {
            messagePayload.from = twilioWhatsAppNumber || 'whatsapp:+14155238886';
        }

        const message = await client.messages.create(messagePayload);

        console.log(`WhatsApp Service: Performance alert sent for ${studentName} to ${parentPhone}. Message SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`WhatsApp Service: Failed to send WhatsApp to ${parentPhone}`, error);
        throw error;
    }
};

module.exports = { sendWhatsAppPerformanceAlert };
