import { Body, Button, Container, Column, Head, Heading, Html, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    confirmationLink?: string;
}

export const WelcomeEmail = ({
    confirmationLink = "https://app.timmy.app/confirm",
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Bienvenue sur Timmy. Sécurisez votre compte.</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Row>
                            <Column align="center">
                                <div style={logoContainer}><span style={logoText}>T</span></div>
                                <Text style={brandName}>Timmy</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Section style={content}>
                        <Heading style={h1}>Bienvenue à bord.</Heading>
                        <Text style={paragraph}>
                            Votre espace de gestion est presque prêt. Vous êtes à un clic de reprendre le contrôle sur vos chantiers et vos équipes.
                        </Text>
                        <Text style={paragraph}>
                            Pour activer votre compte et accéder à votre tableau de bord, veuillez confirmer votre adresse email.
                        </Text>

                        <Section style={btnContainer}>
                            <Button style={button} href={confirmationLink}>
                                Confirmer mon email ➔
                            </Button>
                        </Section>

                        <Text style={paragraphSub}>
                            Si vous n'avez pas créé de compte Timmy, vous pouvez ignorer cet email en toute sécurité.
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>© 2024 Timmy Technologies.</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;

// --- STYLES COMMUNS (A copier/coller pour les autres fichiers aussi) ---
const main = { backgroundColor: "#f1f5f9", fontFamily: 'Inter, sans-serif' };
const container = { backgroundColor: "#ffffff", margin: "40px auto", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", maxWidth: "600px", overflow: "hidden" };
const header = { padding: "32px", textAlign: "center" as const, backgroundColor: "#0F4C5C" }; // Deep Teal Header
const logoContainer = { width: "40px", height: "40px", backgroundColor: "#ffffff", borderRadius: "8px", display: "inline-block", lineHeight: "40px", verticalAlign: "middle" };
const logoText = { color: "#0F4C5C", fontSize: "24px", fontWeight: "bold", fontFamily: "sans-serif" };
const brandName = { fontSize: "24px", fontWeight: "bold", color: "#ffffff", display: "inline-block", marginLeft: "12px", verticalAlign: "middle", margin: "0 0 0 12px" };
const content = { padding: "40px 48px" };
const h1 = { color: "#1e293b", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px" };
const paragraph = { fontSize: "16px", lineHeight: "26px", color:= "#475569", marginBottom: "24px" };
const paragraphSub = { fontSize: "14px", lineHeight: "22px", color:= "#94a3b8", marginTop: "24px" };
const btnContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = { backgroundColor: "#FFC107", borderRadius: "8px", color: "#0f172a", fontSize: "16px", fontWeight: "bold", textDecoration: "none", textAlign: "center" as const, display: "inline-block", padding: "16px 32px" };
const footer = { padding: "24px", textAlign: "center" as const, backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" };
const footerText = { fontSize: "12px", color: "#94a3b8", margin: "0" };