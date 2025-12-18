import nodemailer from "nodemailer";

// 1. Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password",
  },
});

// 2. Dynamic HTML template
const htmlContent = (data, isInvoice = false) => {

  // 🔵 TEMPLATE A — Subscription Confirmation (simple)
  if (!isInvoice) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Subscription Confirmation</h2>

        <p>Hi <b>${data.name || "User"}</b>,</p>
        
        <p>You have successfully subscribed to the <b>${data.plan}</b> plan.</p>

        <p><b>Subscription Details:</b></p>
        <ul>
          <li>Plan: ${data.plan}</li>
          <li>Amount: ${data.amount || "--"}</li>
          <li>Duration: ${data.duration} days</li>
          <li>Payment Method: ${data.paymentMethod || "--"}</li>
          <li>Transaction ID: ${data.transactionId}</li>
          <li>Start Date: ${data.startDate}</li>
        </ul>

        <p>If this wasn’t you, please contact support immediately.</p>

        <br/>
        <p>— The Team</p>
      </div>
    `;
  }

  // 🔵 TEMPLATE B — INVOICE EMAIL (for the USER)
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">

      <h2 style="margin-bottom: 10px;">Your Invoice</h2>
      <p>Hello <b>${data.name || "User"}</b>,</p>
      <p>Thank you for your purchase. Below is your invoice for the subscription:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Invoice To:</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${data.name || "N/A"} <br/>
            ${data.email}
          </td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Plan</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.plan}</td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Duration</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.duration} days</td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Amount</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.amount || "--"}</td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Payment Method</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.paymentMethod}</td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Transaction ID</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.transactionId}</td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Date</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.startDate}</td>
        </tr>
      </table>

      <p style="margin-top: 20px;">If you have any questions about this invoice, feel free to reply to this email.</p>

      <br/>
      <p>— The Team</p>
    </div>
  `;
};

// 3. Send email function
export async function sendMail({ to, subject, text, data, isInvoice = false }) {
  try {
    const info = await transporter.sendMail({
      from: `"Your App" <your_email@gmail.com>`,
      to,
      subject,
      text: text || "",
      html: htmlContent(data, isInvoice),
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}
