import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AppointmentConfirmationEmailProps {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  calendarLinks: {
    google: string;
    outlook: string;
    icsUrl: string;
  };
}

export const AppointmentConfirmationEmail = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  reason,
  calendarLinks,
}: AppointmentConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Confirmare programare la Tandem Dent - {appointmentDate}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tandem Dent</Heading>
          <Hr style={hr} />

          <Text style={text}>Bună ziua, {patientName}!</Text>

          <Text style={text}>
            Programarea dumneavoastră a fost confirmată cu succes.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>Detalii programare:</Text>
            <Text style={detailsText}>
              <strong>Medic:</strong> Dr. {doctorName}
            </Text>
            <Text style={detailsText}>
              <strong>Data:</strong> {appointmentDate}
            </Text>
            <Text style={detailsText}>
              <strong>Ora:</strong> {appointmentTime}
            </Text>
            <Text style={detailsText}>
              <strong>Motiv:</strong> {reason}
            </Text>
          </Section>

          <Section style={calendarSection}>
            <Text style={calendarTitle}>Adăugați în calendar:</Text>
            <Button style={calendarButton} href={calendarLinks.google}>
              Google Calendar
            </Button>
            <Button style={calendarButtonOutline} href={calendarLinks.outlook}>
              Outlook
            </Button>
            <Link href={calendarLinks.icsUrl} style={icsLink}>
              Descarcă fișier .ics
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Dacă aveți nevoie să reprogramați sau să anulați, vă rugăm să ne
            contactați telefonic.
          </Text>

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

export default AppointmentConfirmationEmail;

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

const detailsBox = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const detailsTitle = {
  color: "#d4af37",
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const detailsText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "5px 0",
};

const calendarSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const calendarTitle = {
  color: "#666",
  fontSize: "14px",
  marginBottom: "15px",
};

const calendarButton = {
  backgroundColor: "#d4af37",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 20px",
  margin: "5px",
};

const calendarButtonOutline = {
  backgroundColor: "#fff",
  border: "2px solid #d4af37",
  borderRadius: "6px",
  color: "#d4af37",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 18px",
  margin: "5px",
};

const icsLink = {
  color: "#666",
  fontSize: "12px",
  textDecoration: "underline",
  display: "block",
  marginTop: "10px",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "30px",
};
