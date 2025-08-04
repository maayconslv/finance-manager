import { Service } from "typedi";
import { Resend } from "resend";
import { InternalServerError } from "@/domain/errors/internal-server.error";

interface SendEmailServiceProps {
  from: string;
  to: string;
  subject: string;
  template: React.ReactElement;
}

@Service()
export class SendEmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(process.env["RESEND_KEY"]);
  }

  async sendEmail({ from, to, subject, template }: SendEmailServiceProps) {
    const response = await this.resend.emails.send({
      from,
      to,
      subject,
      react: template,
    });

    if (response.error) {
      throw new InternalServerError(response.error.message);
    }
  }
}
