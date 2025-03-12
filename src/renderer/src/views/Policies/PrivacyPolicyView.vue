<script lang="tsx">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default {
    name: 'PrivacyPolicyView',
    setup() {
        const route = useRoute()
        const { t } = useI18n()

        return {
            route,
            t,
        }
    },
}
</script>

<template>
    <div class="privacy-policy-container">
        <h1>Privacy Policy</h1>

        <p>
            Welcome to Boly! Your privacy is important to us. This Privacy Policy outlines how we collect, use, and
            protect your information when you use our platform.
        </p>

        <h2>1. Information we collect</h2>
        <p>
            We collect the following types of information:
        </p>
        <h3>1.1 Personal Information</h3>
        <li>Name</li>
        <li>Email address</li>
        <li>Billing information (e.g., credit card details)</li>
        <li>Account information (e.g., username, date of birth)</li>
        <h3>1.2 Non-Personal Information</h3>
        <li>Device information (e.g., browser type, operating system)</li>
        <li>Usage data (e.g., pages visited, time spent on the platform)</li>
        <li>IP address</li>

        <h2>2. How we use your information</h2>
        <p>
            We use your information to:
        </p>
        <li>Provide access to our platform and services</li>
        <li>Process transactions and subscriptions</li>
        <li>Improve user experience and platform performance</li>
        <li>Send important updates, promotions, or relevant notifications</li>
        <li>Ensure the security and integrity of our platform</li>

        <h2>3. Sharing Your Information</h2>
        <p>
            We do not sell your personal information. However, we may share your information with trusted third parties
            to:
        </p>
        <li>Process payments (e.g., payment gateways)</li>
        <li>Provide customer support</li>
        <li>Comply with legal obligations</li>

        <h2>4. Cookies and Tracking Technologies</h2>
        <p>
            We use cookies and similar technologies to:
        </p>
        <li>Enhance platform functionality</li>
        <li>Track usage statistics</li>
        <li>Provide personalized content and recommendations</li>
        <p>
            You can control cookie preferences in your browser settings.
        </p>

        <h2>5. Data Security</h2>
        <p>
            We implement industry-standard security measures to protect your data. However, no system is completely
            secure, and we cannot guarantee absolute security.
        </p>

        <h2>6. Your Rights</h2>
        <p>
            You have the right to:
        </p>
        <li>Access, correct, or delete your personal information</li>
        <li>Object to our use of your personal information</li>
        <li>Request a copy of your personal information</li>
        <li>Restrict our use of your personal information</li>
        <li>Receive information about our data practices and how they relate to your personal information</li>
        <li>Exercise your data protection rights</li>

        <h2>7. Third-Party Links</h2>
        <p>
            Our platform may contain links to third-party websites. We are not responsible for their privacy practices.
            Please review their privacy policies before providing any personal information.
        </p>

        <h2>8. Changes to this Privacy Policy</h2>
        <p>
            We may update this Privacy Policy from time to time. Changes will be communicated through our platform or
            via email. Continued use of our services after changes indicates your acceptance of the updated policy. 
        </p>

        <!-- <h2>9. Contact Us</h2>
        <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at
            <a href="mailto:W5u0f@example.com">W5u0f@example.com</a>.
        </p> -->
        <p style="margin-top: 2em">Thank you for trusting Boly. Your privacy is our priority.</p>
    </div>
</template>

<style scoped>
.privacy-policy-container {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    text-align: center;
    margin: auto;
}

.privacy-policy-container h1 {
    font-size: 2em;
    margin-bottom: 1em;
    align-self: center;
    font-weight: bold;
}

.privacy-policy-container h2 {
    font-size: 1.5em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.privacy-policy-container h3 {
    font-size: 1.2em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.privacy-policy-container li {
    margin-bottom: 0.5em;
    font-size: 0.8em;
}

.privacy-policy-container p {
    font-size: 0.8em;
    text-align: left;
    margin-bottom: 1em;
}

</style>