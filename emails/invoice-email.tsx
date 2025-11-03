import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface InvoiceEmailProps {
  clientName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  businessName: string
}

export default function InvoiceEmail({
  clientName = 'Client',
  invoiceNumber = 'INV-2025-0001',
  amount = 1000,
  dueDate = '2025-02-01',
  businessName = 'Your Business',
}: InvoiceEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Html>
      <Head />
      <Preview>Invoice {invoiceNumber} from {businessName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Invoice</Heading>

          <Text style={text}>Hi {clientName},</Text>

          <Text style={text}>
            Here is your invoice from {businessName}.
          </Text>

          <Section style={invoiceBox}>
            <Text style={invoiceItem}>
              <strong>Invoice Number:</strong> {invoiceNumber}
            </Text>
            <Text style={invoiceItem}>
              <strong>Amount Due:</strong> {formattedAmount}
            </Text>
            <Text style={invoiceItem}>
              <strong>Due Date:</strong> {formattedDate}
            </Text>
          </Section>

          <Text style={text}>
            Please process payment by the due date. If you have any questions,
            feel free to reach out.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This invoice was generated using TradeTimer
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#0369a1',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 48px',
}

const invoiceBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  margin: '32px 48px',
  padding: '24px',
}

const invoiceItem = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
}
