import { Body, Button, Container, Column, Head, Heading, Html, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";

// (Réutiliser les mêmes STYLES que le fichier précédent)

interface ResetPasswordEmailProps {
    resetLink?: string;
    userEmail?: string;
}

export const ResetPasswordEmail = ({
    resetLink = "https://app.timmy.app/reset-password",
    userEmail = "utilisateur@entreprise.com",
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Réinitialisation de votre mot de passe Timmy</Preview>
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
                        <Heading style={h1}>Réinitialisation demandée</Heading>
                        <Text style={paragraph}>
                            Nous avons reçu une demande de réinitialisation de mot de passe pour le compte <strong>{userEmail}</strong>.
                        </Text>
                        <Text style={paragraph}>
                            Pas de panique, cela arrive même aux meilleurs managers. Cliquez ci-dessous pour définir un nouveau mot de passe sécurisé.
                        </Text>

                        <Section style={btnContainer}>
                            <Button style={button} href={resetLink}>
                                Changer mon mot de passe ➔
                            </Button>
                        </Section>

                        <Text style={paragraphSub}>
                            ⚠️ <strong>Sécurité :</strong> Ce lien est valide pendant 1 heure. Si vous n'êtes pas à l'origine de cette demande, ne cliquez pas et sécurisez votre compte.
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

export default ResetPasswordEmail;