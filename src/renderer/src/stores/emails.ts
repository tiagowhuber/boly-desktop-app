import { defineStore } from 'pinia'
import axios from 'axios'
// for now it might seem dumb to have a store for emails
const useEmails = defineStore('emails', {
  state: () => ({
  }),
    actions: {
        async sendOrderConfirmationEmail(userId: number, orderId: number) {
        try {
            const response = await axios.post('/v1/payment/send-email', { userId, orderId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error('Error sending test email:', error);
            return { success: false, message: error.response?.data?.message || 'Error sending test email' };
        }
        }
    }
});

export default useEmails;