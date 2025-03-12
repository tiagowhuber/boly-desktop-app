<script lang="tsx">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default {
    name: 'RefundView',
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
    <div class="refund-container">
        <h1>Refund Policy</h1>
        <p>
            At Boly, we strive to provide the best possible experience for our users. This Refund Policy outlines the
            conditions under which refunds may be issued for purchases or subscriptions made on our platform.
        </p>

        <h2>1. General Refund Terms</h2>
        <p>
            Refunds may be granted under specific circumstances as outlined below. Refund requests must comply with this
            policy and be submitted within the designated timeframes.
        </p>

        <h2>2. Refund Eligibility</h2>
        <h3>2.1 Subscription Services:</h3>
        <li>Refunds for subscriptions are generally not provided for partially used billing periods.</li>
        <li>Exceptions may apply in the following cases:</li>
        <li class="indent">Billing errors or duplicate charges.</li>
        <li class="indent">Inability to access the platform due to technical issues caused by Boly.</li>

        <h2>3. Non-Refundable Situations</h2>
        <p>Refunds will not be issued for:</p>
        <li>Change of mind after purchase.</li>
        <li>Subscription cancellations after the billing period has started.</li>
        <li>Issues arising from user actions, such as failure to meet device requirements.</li>

        <h2>4. How to Request a Refund</h2>
        <p>To request a refund:</p>
        <div class="list-container">
            <li class="enumerate">Contact our support team.</li>
            <li class="enumerate">Provide the following details:</li>
            <div class="list-container indent">
                <li class="indent">Your account information (e.g., email or username).</li>
                <li class="indent">Order details (e.g., order number, purchase date).</li>
                <li class="indent">Reason for the refund request.</li>
            </div>
        </div>
        <p>
            Refund requests will be reviewed within [Insert Timeframe, e.g., 5 business days]. If approved, refunds will
            be processed through the original payment method within 7-10 business days.
        </p>

        <h2>5. Chargebacks</h2>
        <p>
            If you initiate a chargeback with your bank or payment provider without first contacting us, your account
            may be suspended or terminated. Please allow us the opportunity to resolve any issues before taking this
            step.
        </p>

        <h2>6. Amendments to This Policy</h2>
        <p>
            We may update this Refund Policy periodically. Changes will be communicated through our platform or via
            email. Continued use of our platform after changes indicates your acceptance of the updated terms.
        </p>

        <p style="margin-top: 2em">
            Thank you for choosing Boly. We appreciate your trust and aim to ensure your satisfaction with our platform.
        </p>
    </div>
</template>

<style scoped>
.refund-container {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    text-align: center;
    margin: auto;
}

.refund-container h1 {
    font-size: 2em;
    margin-bottom: 1em;
    align-self: center;
    font-weight: bold;
}

.refund-container h2 {
    font-size: 1.5em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.refund-container h3 {
    font-size: 1.2em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.refund-container li {
    margin-bottom: 0.5em;
    font-size: 0.8em;
}

.refund-container p {
    font-size: 0.8em;
    text-align: left;
    margin-bottom: 1em;
}

.indent {
    margin-left: 1em;
    list-style: circle;
}

.enumerate {
    margin-left: 1em;
    list-style: decimal;
}

.list-container {
    text-align: left;
}
</style>