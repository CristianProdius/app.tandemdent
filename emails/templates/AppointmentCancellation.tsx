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

interface AppointmentCancellationEmailProps {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  cancellationReason?: string;
}

export const AppointmentCancellationEmail = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  cancellationReason,
}: AppointmentCancellationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Programare anulată - Tandem Dent</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tandem Dent</Heading>
          <Hr style={hr} />

          <Text style={text}>Bună ziua, {patientName}!</Text>

          <Text style={text}>
            Vă informăm că programarea dumneavoastră a fost anulată.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>Detalii programare anulată:</Text>
            <Text style={detailsText}>
              <strong>Medic:</strong> Dr. {doctorName}
            </Text>
            <Text style={detailsText}>
              <strong>Data:</strong> {appointmentDate}
            </Text>
            <Text style={detailsText}>
              <strong>Ora:</strong> {appointmentTime}
            </Text>
            {cancellationReason && (
              <Text style={detailsText}>
                <strong>Motiv anulare:</strong> {cancellationReason}
              </Text>
            )}
          </Section>

          <Section style={rescheduleBox}>
            <Text style={rescheduleTitle}>Doriți să reprogramați?</Text>
            <Text style={rescheduleText}>
              Contactați-ne telefonic pentru a stabili o nouă programare la un
              moment convenabil pentru dumneavoastră.
            </Text>
            <Text style={phoneText}>+373 22 123 456</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Ne cerem scuze pentru orice inconveniență și așteptăm cu nerăbdare să
            vă revedem.
          </Text>

          <Text style={footer}>
            Cu stimă,
            <br />
            Echipa Tandem Dent
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentCancellationEmail;

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
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const detailsTitle = {
  color: "#dc2626",
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

const rescheduleBox = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  textAlign: "center" as const,
};

const rescheduleTitle = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const rescheduleText = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "22px",
  marginBottom: "15px",
};

const phoneText = {
  color: "#d4af37",
  fontSize: "20px",
  fontWeight: "bold",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "30px",
};
