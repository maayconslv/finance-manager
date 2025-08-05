interface SendEmailServiceProps {
  from: string;
  to: string;
  subject: string;
  template: React.ReactElement;
}

export class SendEmailMockService {
  async sendEmail(_data: SendEmailServiceProps) {}
}
