import nodemailer from "nodemailer";

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendAlertEmail(to: string, projectName: string, errorCount: number) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `⚠️ Alert: High error rate on ${projectName}`,
      html: `
        <h2>PulseBoard Alert</h2>
        <p>Your project <strong>${projectName}</strong> has exceeded the error threshold.</p>
        <p>Errors in the last minute: <strong>${errorCount}</strong></p>
        <p>Log in to your dashboard to investigate.</p>
      `,
    });
  }

  async sendDigestEmail(
    to: string,
    name: string,
    projects: { name: string; eventCount: number; errorCount: number }[],
  ) {
    const rows = projects
      .map(
        (p) => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${p.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${p.eventCount}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${p.errorCount}</td>
        </tr>
        `,
      )
      .join("");

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `📊 Your PulseBoard daily digest`,
      html: `
            <h2>Good morning, ${name}!</h2>
            <p>Here's your daily summary for the past 24 hours:</p>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Project</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total Events</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Errors</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `,
    });
  }
}

export const emailService = new EmailService();
