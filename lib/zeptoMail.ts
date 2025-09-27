// /lib/zeptoMail.ts
import { SendMailClient } from "zeptomail";

const url = process.env.ZEPTO_URL!;
const token = process.env.ZEPTO_TOKEN!;
const fromEmail = process.env.ZEPTO_FROM!;

export const zeptoClient = new SendMailClient({ url, token });

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    name: string;
    content: string;
    mimeType?: string;
  }[];
}

export async function sendZeptoMail({
  to,
  subject,
  html,
  attachments,
}: MailOptions) {
  if (!to || !subject || !html) {
    console.error("❌ ZeptoMail: Mandatory field missing", {
      to,
      subject,
      html,
    });
    throw new Error("TM_3201: Mandatory field missing (to, subject, htmlbody)");
  }

  try {
    const response = await zeptoClient.sendMail({
      from: {
        address: fromEmail,
        name: "Coffee Championship",
      },
      to: [
        {
          email_address: { address: to },
        },
      ],
      subject,
      htmlbody: html,
      ...(attachments && {
        attachments: attachments.map((att) => ({
          name: att.name,
          content: att.content,
          mime_type: "application/pdf",
        })),
      }),
    });

    return { success: true };
  } catch (err) {
    console.error("❌ ZeptoMail Error:", err);
    return { success: false, error: err };
  }
}
