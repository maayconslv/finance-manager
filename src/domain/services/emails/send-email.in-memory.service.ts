import { SendEmailService } from "@/domain/services/emails";

interface SendEmailServiceProps {
  from: string;
  to: string;
  subject: string;
  template: React.ReactElement;
}

export class SendEmailInMemoryService extends SendEmailService {
  private sentEmails: SendEmailServiceProps[] = [];

  override async sendEmail(props: SendEmailServiceProps): Promise<void> {
    this.sentEmails.push(props);
  }

  getSentEmails(): SendEmailServiceProps[] {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails.length = 0;
  }
}
