import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AppointmentReminderEmailProps {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

export const AppointmentReminderEmail = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  reason,
}: AppointmentReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Reminder: Programare mâine la Tandem Dent - {appointmentTime}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tandem Dent</Heading>
          <Hr style={hr} />

          <Text style={text}>Bună ziua, {patientName}!</Text>

          <Text style={highlightText}>
            Vă reamintim că aveți o programare mâine.
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

          <Section style={reminderBox}>
            <Text style={reminderTitle}>Pregătire pentru vizită:</Text>
            <Text style={reminderText}>
              • Vă rugăm să ajungeți cu 10 minute înainte
            </Text>
            <Text style={reminderText}>
              • Aduceți actul de identitate și cardul de asigurare (dacă este cazul)
            </Text>
            <Text style={reminderText}>
              • Dacă nu puteți veni, contactați-ne cât mai curând
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Dacă aveți întrebări sau doriți să reprogramați, nu ezitați să ne
            contactați.
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

export default AppointmentReminderEmail;

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

const highlightText = {
  color: "#d4af37",
  fontSize: "18px",
  fontWeight: "bold",
  lineHeight: "26px",
  margin: "20px 0",
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

const reminderBox = {
  backgroundColor: "#fffbeb",
  border: "1px solid #d4af37",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const reminderTitle = {
  color: "#d4af37",
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const reminderText = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "5px 0",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "30px",
};
