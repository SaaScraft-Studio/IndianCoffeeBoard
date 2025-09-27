// /lib/sendConfirmation.ts
import { sendZeptoMail } from "./zeptoMail";
import { generateReceipt } from "./generateReceipt";

interface ConfirmationData {
  name: string;
  email: string;
  mobile: string;
  city: string;
  competitionName: string;
  registrationId: string;
  amount: number;
  paymentId: string;
}

export default async function sendConfirmation(data: ConfirmationData) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2>✅ Registration Successful</h2>
      <p>Dear ${data.name},</p>
      <p>Thank you for registering for the <b>${
        data.competitionName
      }</b> at the 
      <b>${data.city.toUpperCase()} Chapter</b>.</p>
      
      <p><b>Registration ID:</b> ${data.registrationId}</p>
      <p><b>Payment ID:</b> ${data.paymentId}</p>
      <p><b>Amount Paid:</b> ₹ ${data.amount}</p>
      
      <p>Please find your receipt attached as a PDF.</p>
      <p>- Coffee Championship Team</p>
    </div>
  `;

  const pdfBase64 = await generateReceipt({
    ...data,
    date: new Date().toLocaleDateString(),
  });

  return sendZeptoMail({
    to: data.email,
    subject: "Registration Confirmation - Coffee Championship",
    html,
    attachments: [
      {
        name: `Receipt-${data.registrationId}.pdf`,
        content: pdfBase64,
      },
    ],
  });
}
