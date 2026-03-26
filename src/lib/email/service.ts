/**
 * Email Service (Mock Implementation)
 * In production, this would use Resend, SendGrid, or AWS SES.
 */

interface EmailParams {
  to: string;
  subject: string;
  template: "welcome" | "draw_results" | "winner_alert";
  data: Record<string, unknown>;
}

export async function sendEmail({ to, subject, template, data }: EmailParams) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("-----------------------------------------");
  console.log(`[EMAIL SEND] To: ${to}`);
  console.log(`[EMAIL SEND] Subject: ${subject}`);
  console.log(`[EMAIL SEND] Template: ${template}`);
  console.log(`[EMAIL SEND] Data:`, JSON.stringify(data, null, 2));
  console.log("-----------------------------------------");

  return { success: true, messageId: `mock-${Date.now()}` };
}

export const emails = {
  welcome: (email: string, name: string) =>
    sendEmail({
      to: email,
      subject: "Welcome to the Movement — ImpactCaddy",
      template: "welcome",
      data: { name },
    }),

  drawResults: (email: string, name: string, drawTitle: string, matched: number) =>
    sendEmail({
      to: email,
      subject: `Mission Results: ${drawTitle}`,
      template: "draw_results",
      data: { name, drawTitle, matched },
    }),

  winnerAlert: (email: string, name: string, drawTitle: string, prize: string) =>
    sendEmail({
      to: email,
      subject: "🚨 You are an Impact Winner!",
      template: "winner_alert",
      data: { name, drawTitle, prize },
    }),
};
