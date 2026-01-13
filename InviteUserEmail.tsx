import { Body, Button, Container, Column, Head, Heading, Html, Preview, Row, Section, Text, Img } from "@react-email/components";
import * as React from "react";

// COLORS
const mainColor = '#0F4C5C'; // Timmy Teal
const accentColor = '#FFC107'; // Timmy Yellow

interface InviteUserEmailProps {
    inviteLink?: string;
    inviterName?: string;
    organizationName?: string;
    role?: string;
}

export const InviteUserEmail = ({
    inviteLink = "https://app.timmy.app/invite",
    inviterName = "Jean Dupont",
    organizationName = "BTP Gabon",
    role = "Manager",
}: InviteUserEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>{inviterName} vous invite à rejoindre {organizationName} sur Timmy.</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* HEADER */}
                    <Section style={header}>
                        <Row>
                            <Column align="center">
                                <Text style={brandName}>Timmy</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* CONTENT */}
                    <Section style={content}>
                        <Heading style={h1}>Vous avez été invité.</Heading>

                        <Section style={inviteBox}>
                            <Text style={inviteText}>
                                <strong>{inviterName}</strong> vous invite à rejoindre l'organisation <strong>{organizationName}</strong>.
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            Votre rôle a été défini comme : <strong style={{ color: mainColor }}>{role}</strong>.
                        </Text>
                        <Text style={paragraph}>
                            Rejoignez votre équipe pour commencer à gérer les plannings, suivre les pointages et optimiser la gestion RH.
                        </Text>

                        <Section style={btnContainer}>
                            <Button style={button} href={inviteLink}>
                                Accepter l'invitation
                            </Button>
                        </Section>

                        <Text style={paragraphSub}>
                            Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
                        </Text>
                    </Section>

                    {/* FOOTER */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Timmy Technologies.<br />
                            Simplifiez la gestion de vos équipes.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default InviteUserEmail;

// STYLES
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    margin: '0',
    padding: '20px 0',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    maxWidth: '580px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
    backgroundColor: mainColor,
    padding: '30px 20px',
    textAlign: 'center' as const,
};

const logoContainer = {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px',
};

const logoText = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '800',
    lineHeight: '48px', // vertically center in div for some email clients
    margin: 0,
};

const brandName = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    letterSpacing: '-0.5px',
};

const content = {
    padding: '40px 40px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 20px',
    textAlign: 'center' as const,
};

const inviteBox = {
    backgroundColor: '#f0f9ff',
    border: `1px solid ${mainColor}20`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const inviteText = {
    margin: '0',
    color: '#334155',
    fontSize: '16px',
    lineHeight: '24px',
};

const paragraph = {
    color: '#4a5568',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '20px',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '32px',
    marginBottom: '32px',
};

const button = {
    backgroundColor: accentColor,
    color: mainColor,
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const paragraphSub = {
    color: '#718096',
    fontSize: '13px',
    lineHeight: '20px',
    marginTop: '20px',
    textAlign: 'center' as const,
};

const footer = {
    backgroundColor: '#f8fafc',
    padding: '24px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0',
};