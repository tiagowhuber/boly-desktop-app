<template>
  <div class="email-success-container">
    <div class="success-content">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>
      </div>
      
      <h1 class="success-title">{{ $t('email_sent_success_title') || 'Message Sent Successfully!' }}</h1>
      
      <p class="success-message">
        {{ $t('email_sent_success_message') || 'Thank you for contacting us! We have received your message and will get back to you as soon as possible.' }}
      </p>
      
      <div class="success-actions">
        <router-link to="/" class="btn-primary">
          {{ $t('back_to_home') || 'Back to Home' }}
        </router-link>
        
        <router-link to="/contact" class="btn-secondary">
          {{ $t('send_another_message') || 'Send Another Message' }}
        </router-link>
      </div>
      
      <div class="contact-info">
        <p class="contact-text">
          {{ $t('contact_alternative') || 'You can also reach us directly at:' }}
        </p>
        <div class="contact-methods">
          <a href="mailto:contact@boly.cl" class="contact-method">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            contact@boly.cl
          </a>
          
          <a href="https://wa.me/+56979966798" class="contact-method" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.777-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.336-.445-.342-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// Add some celebration effect on mount
onMounted(() => {
  // Optional: Add some confetti or animation effect here
  console.log('Contact form submitted successfully!');
});
</script>

<style scoped>
.email-success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.success-icon {
  color: #28a745;
  margin-bottom: 2rem;
  animation: scaleIn 0.6s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.success-message {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  animation: slideInUp 0.8s ease-out 0.4s both;
}

@keyframes slideInUp {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  animation: slideInUp 0.8s ease-out 0.6s both;
}

.btn-primary, .btn-secondary {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.contact-info {
  border-top: 1px solid #e9ecef;
  padding-top: 2rem;
  animation: slideInUp 0.8s ease-out 0.8s both;
}

.contact-text {
  font-family: 'Poppins', sans-serif;
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.contact-methods {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.contact-method:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .success-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .success-title {
    font-size: 2rem;
  }
  
  .success-message {
    font-size: 1.1rem;
  }
  
  .success-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 250px;
  }
  
  .contact-methods {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
