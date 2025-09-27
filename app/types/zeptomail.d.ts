// types/zeptomail.d.ts
declare module "zeptomail" {
  export interface SendMailOptions {
    from: { address: string; name?: string };
    to: { email_address: { address: string } }[];
    subject: string;
    htmlbody?: string;
    textbody?: string;
  }

  export class SendMailClient {
    constructor(config: { url: string; token: string });
    sendMail(options: SendMailOptions): Promise<any>;
  }
}
