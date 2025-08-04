import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import React from "react";

interface ForgotPasswordTemplateProps {
  forgotPasswordToken: string;
}

const baseUrl = process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : "";

export default function ForgotPasswordTemplate({ forgotPasswordToken }: ForgotPasswordTemplateProps) {
  const forgotPasswordUrl = `${baseUrl}/reset-password?token=${forgotPasswordToken}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Esqueceu sua senha?</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Text style={logoTitle}>Finance Manager</Text>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Esqueceu sua senha?</Heading>
              <Text style={mainText}>
                Não se preocupe! Vamos te ajudar a redefinir sua senha. Basta clicar no botão abaixo para criar uma nova
                senha.
              </Text>
              <Section style={verificationSection}>
                {/* <Text style={verifyText}>Link de redefinição de senha</Text> */}

                <Text style={verifyText}>
                  Clique{" "}
                  <Link href={forgotPasswordUrl} target="_blank" style={link}>
                    aqui
                  </Link>{" "}
                  para redefinir sua senha.
                </Text>
                <Text style={validityText}>(Este link é válido por 30 minutos)</Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>Se você não solicitou a redefinição de senha, ignore este email.</Text>
            </Section>
          </Section>
          <Text style={footerText}>
            Finance Manager é um sistema desenvolvido por{" "}
            <Link href="https://github.com/maayconslv" target="_blank" style={link}>
              Maycon Silva
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ForgotPasswordTemplate.PreviewProps = {
  forgotPasswordToken: "123456",
} satisfies ForgotPasswordTemplateProps;

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const logoTitle = {
  color: "#fff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const imageSection = {
  backgroundColor: "#252f3d",
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: "bold",
  textAlign: "center" as const,
};

const validityText = {
  ...text,
  margin: "0px",
  textAlign: "center" as const,
};

const verificationSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };
