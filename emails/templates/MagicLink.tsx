import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  patientName: string;
  magicLink: string;
  expiresInMinutes: number;
}

export const MagicLinkEmail = ({
  patientName,
  magicLink,
  expiresInMinutes,
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Autentificare Tandem Dent - Link de acces</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tandem Dent</Heading>
          <Hr style={hr} />

          <Text style={text}>Bună ziua, {patientName}!</Text>

          <Text style={text}>
            Ați solicitat accesul la portalul pacientului Tandem Dent. Apăsați
            butonul de mai jos pentru a vă autentifica:
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={magicLink}>
              Accesează portalul
            </Button>
          </Section>

          <Text style={warningText}>
            Acest link expiră în {expiresInMinutes} minute.
          </Text>

          <Text style={text}>
            Dacă nu ați solicitat acest link, puteți ignora acest email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Cu stimă,
            <br />
            Echipa Tandem Dent
            <br />
            Tel: +373 22 123 456
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const h1 = {
  color: "#d4af37",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "20px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#d4af37",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 30px",
};

const warningText = {
  color: "#666",
  fontSize: "14px",
  textAlign: "center" as const,
  fontStyle: "italic",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "30px",
};
