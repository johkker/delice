declare module 'sib-api-v3-sdk' {
    export const ApiClient: {
        instance: {
            authentications: {
                'api-key': {
                    apiKey: string;
                };
            };
        };
    };

    export class TransactionalEmailsApi {
        sendTransacEmail(email: SendSmtpEmail): Promise<any>;
    }

    export class ContactsApi {
        createContact(contact: CreateContact): Promise<any>;
    }

    export class SendSmtpEmail {
        sender: {
            email: string;
            name: string;
        };
        to: Array<{
            email: string;
            name: string;
        }>;
        subject: string;
        templateId?: number;
        params?: {
            [key: string]: string;
        };
        htmlContent?: string;
    }

    export class CreateContact {
        email: string;
        attributes?: {
            [key: string]: string | number | boolean;
        };
        listIds?: number[];
    }
} 