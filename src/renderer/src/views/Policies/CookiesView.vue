<script lang="tsx">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default {
    name: 'CookiesView',
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
    <div class="cookies-container">
        <h1>Cookie Policy</h1>
        <p>
            Boly uses cookies and similar technologies to enhance your experience on our platform. This Cookie Policy
            explains what cookies are, how we use them, and your choices regarding their use.
        </p>

        <h2>1. What are Cookies</h2>
        <p>
            Cookies are small text files stored on your device when you visit a website. They help websites remember
            your preferences, improve functionality, and provide personalized experiences.
        </p>
        <p>
            We use the following types of cookies:
        </p>
        <li><b>Essential Cookies:</b> Necessary for the platform’s operation and security.</li>
        <li><b>Performance Cookies::</b> Help us analyse how users interact with the platform to improve performance.
        </li>
        <li><b>Functionality Cookies:</b> Help us understand how users interact with the platform and how they use it.
        </li>
        <li><b>Advertising Cookies:</b> Used to deliver relevant ads based on your browsing activity.</li>

        <h2>2. Why We Use Cookies</h2>
        <p>
            We use cookies to:
        </p>
        <li>Ensure the platform functions properly.</li>
        <li>Remember your preferences, such as language or login details.</li>
        <li>Analyse platform performance and usage trends.</li>
        <li>Provide personalized recommendations and advertisements.</li>

        <h2>3. Cookies and Third-Party Services</h2>
        <p>
            We may allow trusted third-party services to place cookies on your device. These cookies may:
        </p>
        <li>Track your interactions with advertisements.</li>
        <li>Analyse website traffic and user behaviour.</li>
        <p>Examples of third-party services we use include:</p>
        <li>Analytics tools (e.g., Google Analytics)</li>
        <li>Advertising networks</li>

        <h2>4. Your Cookie Choices</h2>
        <p>You can manage your cookie preferences through:</p>
        <li><b>Browser Settings: </b> Adjust your browser settings to block or delete cookies.</li>
        <li><b>Cookie Banners: </b> Use the cookie consent banner on our platform to accept or reject specific types of
            cookies.</li>
        <p>Please note that disabling certain cookies may impact the functionality of the platform.</p>

        <h2>5. Data Protection</h2>
        <p>
            Cookies may collect information that qualifies as personal data. All such data is processed in accordance
            with our <a href="/privacy">Privacy Policy</a>, which outlines how we protect your information.
        </p>

        <h2>6. Changes to this Cookie Policy</h2>
        <p>
            We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements.
            Updates will be communicated through our platform or via email.
        </p>

        <p style="margin-top: 2em">
            Thank you for trusting Boly. Your privacy and experience are our priorities.
        </p>
    </div>
</template>

<style scoped>
.cookies-container {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    text-align: center;
    margin: auto;
}

.cookies-container h1 {
    font-size: 2em;
    margin-bottom: 1em;
    align-self: center;
    font-weight: bold;
}

.cookies-container h2 {
    font-size: 1.5em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.cookies-container h3 {
    font-size: 1.2em;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.cookies-container li {
    margin-bottom: 0.5em;
    font-size: 0.8em;
}

.cookies-container p {
    font-size: 0.8em;
    text-align: left;
    margin-bottom: 1em;
}

.cookies-container a {
    font-weight: bold;
}
</style>