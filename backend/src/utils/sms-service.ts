/**
 * SMS Service using Brevo API
 * 
 * This service implements SMS sending using Brevo's API.
 * Docs: https://developers.brevo.com/docs/transactional-sms-endpoints
 */

import axios from 'axios';

// Brevo SMS configurations
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
const SMS_LOG_ONLY = process.env.SMS_LOG_ONLY === 'true';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER = process.env.BREVO_SENDER_NAME || 'Delice';
const BREVO_API_URL = 'https://api.brevo.com/v3/transactionalSMS/sms';

/**
 * Sends an SMS message using Brevo API
 * @param phoneNumber The recipient's phone number
 * @param message The message to send
 * @returns A promise that resolves to true if the message was sent, false otherwise
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
    try {
        // Check if SMS is enabled
        if (!SMS_ENABLED) {
            // Just log the message in development
            console.log(`[SMS Disabled] Would send to ${phoneNumber}: ${message}`);
            return true;
        }

        // In log-only mode (useful for testing), just log the SMS
        if (SMS_LOG_ONLY) {
            console.log(`[SMS Log] To: ${phoneNumber}, Message: ${message}`);
            return true;
        }

        // Ensure the phone number is in international format (starts with +)
        const formattedPhone = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+${phoneNumber}`;

        // Send SMS using Brevo API
        const response = await axios.post(
            BREVO_API_URL,
            {
                sender: BREVO_SENDER,
                recipient: formattedPhone,
                content: message,
                type: 'transactional'
            },
            {
                headers: {
                    'api-key': BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log(`[SMS Sent] Message to ${phoneNumber} sent successfully. ID: ${response.data?.messageId}`);
        return true;
    } catch (error) {
        // Log detailed error information
        if (axios.isAxiosError(error)) {
            console.error('Error sending SMS via Brevo:', error.response?.data || error.message);
        } else {
            console.error('Error sending SMS:', error);
        }
        return false;
    }
};

/**
 * Sends a verification code via SMS
 * @param phoneNumber The recipient's phone number
 * @param code The verification code
 * @param userName The name of the user (optional)
 * @returns A promise that resolves to true if the message was sent, false otherwise
 */
export const sendVerificationSMS = async (
    phoneNumber: string,
    code: string,
    userName?: string
): Promise<boolean> => {
    const greeting = userName ? `Olá ${userName},` : 'Olá,';
    const message = `${greeting} seu código de verificação Delice é: ${code}. Válido por 10 minutos.`;

    return sendSMS(phoneNumber, message);
}; 