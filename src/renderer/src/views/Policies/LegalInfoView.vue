<script lang="tsx">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default {
    name: 'LegalInfoView',
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
    <div class="legal-info-container">
        <h1>Legal Info</h1>
        <p>
            Welcome to Boly! By accessing or using our platform, you agree to comply with the following legal terms and
            conditions. Please read them carefully.
        </p>

        <h2>1. Ownership and Intellectual Property</h2>
        <p>
            All content on the Boly platform, including text, graphics, logos, images, videos, and software, is the
            property of Boly or its licensors and is protected by copyright, trademark, and other intellectual property
            laws. Unauthorized use of our intellectual property is strictly prohibited.
        </p>

        <h2>2. User Responsibilities</h2>
        <p>
            By using our platform, you agree to:
        </p>
        <li>Provide accurate and up-to-date information during registration.</li>
        <li>Use the platform only for lawful purposes and in compliance with all applicable laws.</li>
        <li>Refrain from engaging in activities that may harm the platform, its users, or its reputation.</li>
        <li>Protect your account credentials and notify us immediately of any unauthorized access.</li>

        <h2>3. Payment and Subscriptions</h2>
        <li>Payments for individual games or subscriptions must be completed through the authorized payment methods
            available on the platform.</li>
        <li>Subscription plans will auto-renew unless cancelled before the renewal date.</li>
        <li>Refunds, if applicable, are subject to our Refund Policy.</li>

        <h2>4. Limitation of Liability</h2>
        <p>
            To the fullest extent permitted by law, Boly shall not be held liable for:
        </p>
        <li>Indirect, incidental, or consequential damages arising from the use or inability to use the platform.</li>
        <li>Errors, interruptions, or technical issues affecting access to the platform.</li>

        <h2>5. Termination</h2>
        <p>
            We reserve the right to suspend or terminate your access to the platform if you violate these terms or engage in prohibited activities. Any outstanding payments or legal obligations will remain enforceable after termination.
        </p>

        <h2>6. Governing Law</h2>
        <p>
            These terms are governed by and construed in accordance with the laws of [Insert Jurisdiction]. Any disputes arising from these terms or your use of the platform shall be resolved in the courts of [Insert Jurisdiction].
        </p>

        <h2>7. Changes to these Terms</h2>
        <p>
            We may update these legal terms from time to time. Changes will be communicated through our platform or via email. Continued use of the platform after changes indicates your acceptance of the updated terms.
        </p>

        <p style="margin-top: 2em">
            Thank you for choosing Boly. We are committed to providing a safe and enjoyable platform for educational gaming.
        </p>
    </div>
</template>

<style scoped>
.legal-info-container {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    text-align: center;
    margin: auto;
}

.legal-info-container h1 {
    font-size: 2em;
    margin-bottom: 1em;
    align-self: center;
    font-weight: bold;
}

.legal-info-container h2 {
    font-size: 1.5em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.legal-info-container h3 {
    font-size: 1.2em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.legal-info-container li {
    margin-bottom: 0.5em;
    font-size: 0.8em;
}

.legal-info-container p {
    font-size: 0.8em;
    text-align: left;
    margin-bottom: 1em;
}
</style>