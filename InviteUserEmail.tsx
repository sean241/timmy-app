import { Body, Button, Container, Column, Head, Heading, Html, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";

// (Réutiliser les mêmes STYLES que le fichier précédent)

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
                    <Section style={header}>
                        <Row>
                            <Column align="center">
                                <div style={logoContainer}><span style={logoText}>T</span></div>
                                <Text style={brandName}>Timmy</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Section style={content}>
                        <Heading style={h1}>Vous avez été invité.</Heading>

                        <Section style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                            <Text style={{ margin: 0, color: '#334155', fontWeight: '500' }}>
                                <strong>{inviterName}</strong> vous invite à rejoindre l'organisation <strong>{organizationName}</strong>.
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            Votre rôle a été défini comme : <strong>{role}</strong>.
                        </Text>
                        <Text style={paragraph}>
                            Rejoignez votre équipe pour commencer à gérer les plannings, suivre les pointages et optimiser la gestion RH.
                        </Text>

                        <Section style={btnContainer}>
                            <Button style={button} href={inviteLink}>
                                Accepter l'invitation ➔
                            </Button>
                        </Section>

                        <Text style={paragraphSub}>
                            Si vous pensez qu'il s'agit d'une erreur, vous pouvez ignorer cet email.
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

export default InviteUserEmail;