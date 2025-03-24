import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { config } from 'dotenv';

// Load environment variables
config();

// Custom error class for email-related errors
export class EmailError extends Error {
    isEmailError = true;

    constructor(message: string) {
        super(message);
        this.name = 'EmailError';
        // This is needed due to extending built-in classes in TypeScript
        Object.setPrototypeOf(this, EmailError.prototype);
    }
}

// Initialize the Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || 'your-brevo-api-key';

// Email API and contact API instances
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
const contactsApi = new SibApiV3Sdk.ContactsApi();

// Types
type EmailRecipient = {
    email: string;
    name?: string;
};

type EmailParams = {
    [key: string]: string;
};

export type EmailOptions = {
    subject: string;
    templateId?: number;
    htmlContent?: string;
    params?: EmailParams;
};

// Create a contact in Brevo
export const createContact = async (
    email: string,
    attributes: { [key: string]: string | number | boolean } = {},
    listIds: number[] = []
): Promise<boolean> => {
    try {
        const createContact = new SibApiV3Sdk.CreateContact();

        createContact.email = email;
        createContact.attributes = attributes;

        if (listIds.length > 0) {
            createContact.listIds = listIds;
        }

        await contactsApi.createContact(createContact);
        console.log(`Contact created successfully for email: ${email}`);
        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating contact in Brevo for ${email}:`, errorMessage);
        throw new EmailError(`Error creating contact: ${errorMessage}`);
    }
};

// Send a transactional email
export const sendEmail = async (
    to: EmailRecipient | EmailRecipient[],
    options: EmailOptions
): Promise<boolean> => {
    try {
        const recipients = Array.isArray(to) ? to : [to];
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        // Set sender information
        sendSmtpEmail.sender = {
            email: process.env.BREVO_SENDER_EMAIL || 'no-reply@delice.com',
            name: process.env.BREVO_SENDER_NAME || 'Delice',
        };

        // Set recipient(s)
        sendSmtpEmail.to = recipients.map(recipient => ({
            email: recipient.email,
            name: recipient.name || recipient.email,
        }));

        // Set email subject
        sendSmtpEmail.subject = options.subject;

        // Use template if provided, otherwise use HTML content
        if (options.templateId) {
            sendSmtpEmail.templateId = options.templateId;

            if (options.params) {
                sendSmtpEmail.params = options.params;
            }
        } else if (options.htmlContent) {
            sendSmtpEmail.htmlContent = options.htmlContent;
        } else {
            throw new EmailError('Either templateId or htmlContent must be provided');
        }

        // Send the email
        await emailApi.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent successfully to ${JSON.stringify(recipients)}`);
        return true;
    } catch (error) {
        const recipientInfo = Array.isArray(to)
            ? to.map(r => r.email).join(', ')
            : to.email;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error sending email via Brevo to ${recipientInfo}:`, errorMessage);
        throw new EmailError(`Error sending email: ${errorMessage}`);
    }
};

// Send welcome email to new user
export const sendWelcomeEmail = async (
    userEmail: string,
    userName: string
): Promise<boolean> => {
    try {
        const htmlContent = `
    <html>
      <body>
        <h1>Bem-vindo à Delice, ${userName}!</h1>
        <p>Estamos felizes em tê-lo como parte da nossa comunidade de artesãos e amantes de comida artesanal.</p>
        <p>Com a Delice, você pode:</p>
        <ul>
          <li>Descobrir produtos artesanais exclusivos</li>
          <li>Conectar-se diretamente com produtores locais</li>
          <li>Compartilhar suas experiências através de avaliações</li>
        </ul>
        <p>Se você tiver qualquer dúvida ou precisar de ajuda, não hesite em entrar em contato conosco.</p>
        <p>Atenciosamente,<br>Equipe Delice</p>
      </body>
    </html>
  `;

        return await sendEmail(
            { email: userEmail, name: userName },
            {
                subject: 'Bem-vindo à Delice - Sua plataforma de comida artesanal',
                htmlContent,
            }
        );
    } catch (error) {
        console.error(`Failed to send welcome email to ${userEmail}:`, error);
        // Re-throw as EmailError but maintain the original stack trace
        throw error instanceof EmailError
            ? error
            : new EmailError(`Failed to send welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Create a new user contact in Brevo
export const createUserContact = async (
    email: string,
    name: string,
    phone: string,
    document: string
): Promise<boolean> => {
    try {
        const attributes = {
            NOME: name,
            TELEFONE: phone,
            DOCUMENTO: document,
        };

        // You can specify list IDs here if you have created lists in Brevo
        const listIds: number[] = [];

        return await createContact(email, attributes, listIds);
    } catch (error) {
        console.error(`Failed to create user contact for ${email}:`, error);
        // Re-throw as EmailError but maintain the original stack trace
        throw error instanceof EmailError
            ? error
            : new EmailError(`Failed to create user contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}; 