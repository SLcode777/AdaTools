import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface DomainReminderEmailProps {
  domains: Array<{
    domain: string;
    registrar: string;
    registrarUrl?: string | null;
    expiresAt: Date;
    autoRenew: boolean;
  }>;
  daysUntilExpiry: number;
}

export default function DomainReminderEmail({
  domains = [
    {
      domain: "adatools.dev",
      registrar: "Porkbun",
      registrarUrl: "https://porkbun.com",
      expiresAt: new Date("2026-12-22"),
      autoRenew: true,
    },
    {
      domain: "example.com",
      registrar: "Namecheap",
      registrarUrl: null,
      expiresAt: new Date("2026-01-15"),
      autoRenew: false,
    },
  ],
  daysUntilExpiry = 7,
}: DomainReminderEmailProps) {
  const timeFrame = daysUntilExpiry <= 7 ? "1 week" : "1 month";

  return (
    <Html>
      <Head />
      <Preview>
        {String(domains.length)} domain{domains.length > 1 ? "s" : ""} expiring
        in {timeFrame}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Domain Expiration Reminder</Heading>
          <Text style={paragraph}>
            You have {String(domains.length)} domain
            {domains.length > 1 ? "s" : ""} expiring in {timeFrame}:
          </Text>

          {domains.map((domain, index) => (
            <Section key={index} style={domainSection}>
              <Text style={domainName}>{domain.domain}</Text>
              <Text style={detail}>
                <strong>Registrar:</strong>{" "}
                {domain.registrarUrl ? (
                  <Link href={domain.registrarUrl} style={link}>
                    {domain.registrar}
                  </Link>
                ) : (
                  domain.registrar
                )}
              </Text>
              <Text style={detail}>
                <strong>Expires:</strong>{" "}
                {new Date(domain.expiresAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={detail}>
                <strong>Auto Renew:</strong>{" "}
                {domain.autoRenew ? "✓ Enabled" : "✗ Disabled"}
              </Text>
            </Section>
          ))}

          <Text style={footer}>
            This is an automated reminder from your Domain Names Manager in
            AdaTools 💙
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 20px 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#484848",
  padding: "0",
};

const domainSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const domainName = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#18181b",
  margin: "0 0 12px",
};

const detail = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#52525b",
  margin: "4px 0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};

const footer = {
  fontSize: "12px",
  color: "#71717a",
  textAlign: "center" as const,
  padding: "24px 0 0",
};
