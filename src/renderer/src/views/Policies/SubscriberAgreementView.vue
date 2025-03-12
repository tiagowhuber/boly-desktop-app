<script lang="tsx">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default {
    name: 'SubscriberAgreementView',
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
    <div class="subscriber-agreement-container">
        <h1>Subscriber Agreement</h1>
        <p>
            This Subscriber Agreement outlines the terms and conditions for subscribing to Boly’s educational video game
            platform. By purchasing a subscription, you agree to the following terms:
        </p>

        <h2>1. Subscription Services</h2>
        <p>
            Boly offers subscription-based access to a curated library of educational video games ("Services").
            Subscription tiers, benefits, and pricing details are outlined on our platform.
        </p>

        <h2>2. Eligibility</h2>
        <p>Subscribers must:</p>
        <li>Be at least 18 years old or have the consent of a parent or legal guardian.</li>
        <li>Provide accurate and complete registration information.</li>
        <li>Agree to comply with all terms and policies associated with the Services.</li>

        <h2>3. Payment and Cancellation</h2>
        <h3>3.1 Payment Methods:</h3>
        <p>
            Subscribers are required to provide a valid payment method. Accepted payment methods are displayed on the
            platform.
        </p>
        <h3>3.2 Billing Cycle:</h3>
        <li>
            Subscriptions are billed on a recurring basis (e.g., monthly or yearly) as selected during the registration
            process.
        </li>
        <li>
            The billing date will be the same day of the month as the original subscription date.
        </li>
        <h3>3.3 Auto-Renewal:</h3>
        <p>
            Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to the renewal
            date.
        </p>
        <h3>Price Changes:</h3>
        <p>
            Boly reserves the right to modify subscription pricing. Price changes will be communicated at least [Insert
            Notice Period] days before taking effect.
        </p>

        <h2>4. Cancellation and Refunds</h2>
        <h3>4.1 Cancellation:</h3>
        <p>
            Subscribers may cancel their subscription at any time through their account settings. Access to the Services
            will continue until the end of the current billing period.
        </p>
        <h3>4.2 Refunds:</h3>
        <p>
            Refunds are not provided for partial billing periods. Exceptions may apply in cases of technical errors or
            as required by applicable laws.
        </p>

        <h2>5. Subscriber Obligations</h2>
        <p>
            Subscribers agree to:
        </p>
        <li>Use the Services only for personal, non-commercial purposes.</li>
        <li>Refrain from sharing login credentials or subscription access with unauthorized users.</li>
        <li>Abide by all usage guidelines and policies outlined by Boly.</li>

        <h2>6. Account Suspension or Termination</h2>
        <p>
            Boly reserves the right to suspend or terminate a subscription without notice for:
        </p>
        <li>Breaches of this Agreement or other policies.</li>
        <li>Unlawful activities or actions harmful to the platform or its users.</li>

        <h2>7. Intellectual Property</h2>
        <p>
            All content provided through the Services remains the intellectual property of Boly or its licensors.
            Subscribers are granted a limited, non-transferable licence to access the content for personal use.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
            To the extent permitted by law, Boly shall not be liable for:
        </p>
        <li>Interruptions or technical issues affecting the Services.</li>
        <li>Losses or damages arising from unauthorized access to your account.</li>
        <li>Indirect, incidental, or consequential damages related to the use of the Services.</li>

        <h2>9. Changes to the Agreement</h2>
        <p>
            Boly may update this Agreement periodically. Changes will be communicated through the platform or via email.
            Continued use of the Services after changes indicates your acceptance of the updated terms.
        </p>

        <p style="margin-top: 2em">
            Thank you for subscribing to Boly. We’re excited to bring you a world of educational gaming!
        </p>
    </div>
</template>

<style scoped>
.subscriber-agreement-container {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    text-align: center;
    margin: auto;
}

.subscriber-agreement-container h1 {
    font-size: 2em;
    margin-bottom: 1em;
    align-self: center;
    font-weight: bold;
}

.subscriber-agreement-container h2 {
    font-size: 1.5em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.subscriber-agreement-container h3 {
    font-size: 1.2em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.subscriber-agreement-container li {
    margin-bottom: 0.5em;
    font-size: 0.8em;
}

.subscriber-agreement-container p {
    font-size: 0.8em;
    text-align: left;
    margin-bottom: 1em;
}
</style>