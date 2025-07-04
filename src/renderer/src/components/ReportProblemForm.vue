<script setup>
import TagAbove from '@/components/forms/TagAbove.vue'
import AlertModal from '@/components/AlertModal.vue'
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
const i18n = useI18n();

const form = ref(null)
const showModal = ref(false)
const modalText = ref('')
const canSend = ref(true)

const title = ref('')
const email = ref('')
const category = ref('')
const details = ref('')

const categories = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'account', label: 'Account Issue' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'performance', label: 'Performance Issue' },
  { value: 'ui', label: 'UI/UX Issue' },
  { value: 'other', label: 'Other' }
]

async function SendReport() {
  if (title.value.length == 0 
  || category.value.length == 0 
  || details.value.length == 0) {
    modalText.value = i18n.t('modal_required_fields') || 'Please fill in all required fields';
    showModal.value = true
    return
  }

  canSend.value = false;

  try {
    // Send report through your backend API
    const reportData = {
      title: title.value,
      email: email.value || null,
      category: category.value,
      details: details.value,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    const response = await axios.post('/v1/support/report', reportData);
    
    if (response.data && response.data.success) {
      modalText.value = i18n.t('report_sent_success') || 'Your report has been sent successfully. We will investigate and get back to you soon.'
      showModal.value = true;
      canSend.value = true;
      
      // Reset form
      title.value = ''
      email.value = ''
      category.value = ''
      details.value = ''
    } else {
      throw new Error('API response indicates failure');
    }
  } catch (error) {
    console.error('Failed to send report:', error);
    modalText.value = i18n.t('report_sent_error') || 'Failed to send report. Please try again later.'
    showModal.value = true;
    canSend.value = true;
  }
}
</script>

<template>
  <div class="report-form">
    <div class="form-container">
      <form ref="form" class="mform" @submit.prevent="SendReport">
        <div>
          <!-- Title Input -->
          <TagAbove>
            {{ $t('problem_title') || 'What happened?' }} *
            <template #child>
              <input
                class="text"
                type="text"
                name="title"
                v-model="title" 
                :placeholder="$t('problem_title_placeholder') || 'Brief description of the issue'"
                required
              />
            </template>
          </TagAbove>

          <!-- Email Input (Optional) -->
          <TagAbove>
            {{ $t('email') || 'Email' }} ({{ $t('optional') || 'Optional' }})
            <template #child>
              <input
                class="text"
                type="email"
                name="email"
                v-model="email"
                :placeholder="$t('email_placeholder') || 'your email'"
              />
              <p class="email-note">
                {{ $t('email_feedback_note') || 'Provide your email if you want us to follow up with you about this issue.' }}
              </p>
            </template>
          </TagAbove>

          <!-- Category Dropdown -->
          <TagAbove>
            {{ $t('problem_category') || 'Category' }} *
            <template #child>
              <select
                class="text select"
                name="category"
                v-model="category"
                required
              >
                <option value="">{{ $t('select_category') || 'Select a category' }}</option>
                <option 
                  v-for="cat in categories" 
                  :key="cat.value" 
                  :value="cat.value"
                >
                  {{ $t('category_' + cat.value) || cat.label }}
                </option>
              </select>
            </template>
          </TagAbove>

          <!-- Details Textarea -->
          <TagAbove>
            {{ $t('problem_details') || 'Details' }} *
            <template #child>
              <textarea
                class="text"
                name="details"
                v-model="details"
                :placeholder="$t('problem_details_placeholder') || 'Please describe the issue in detail. Include steps to reproduce, expected behavior, and actual behavior.'"
                required
              ></textarea>
            </template>
          </TagAbove>

          <input 
            class="submit-button button_text" 
            type="submit" 
            :value="$t('submit_report') || 'Submit Report'" 
            :disabled="!canSend"
          >
        </div>
      </form>
    </div>
  </div>

  <Teleport to="body">
    <AlertModal :show="showModal" @close="showModal = false">
      <template #header>
        <h3>{{ $t('notification') || 'Notification' }}</h3>
      </template>
      <template #body>{{ modalText }}</template>
    </AlertModal>
  </Teleport>
</template>

<style scoped>
.report-form {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  justify-content: center;
}

.form-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mform {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mform > div {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

input,
textarea,
select {
  resize: none;
  max-width: 100%;
  outline: none;
  padding: 1rem;
  border-radius: 8px;
  background-color: white;
  border: 2px solid #e9ecef;
  color: #333;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input::placeholder,
textarea::placeholder {
  color: #6c757d;
  opacity: 0.8;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.submit-button {
  width: auto;
  min-width: 200px;
  height: 50px;
  background-color: #667eea;
  border: none;
  border-radius: 25px;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem auto 0;
  display: block;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.button_text {
  padding: 0;
}

.email-note {
  font-size: 0.775rem;
  color: #6b7280;
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-style: italic;
  line-height: 1.4;
}

/* Required field indicator */
:deep(.tag-above) {
  position: relative;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .report-form {
    width: 100%;
    padding: 0;
  }

  .form-container {
    padding: 1.5rem;
    margin: 0 1rem;
    border-radius: 8px;
  }

  .mform {
    gap: 1.25rem;
  }

  .mform > div {
    gap: 1.25rem;
  }

  input,
  textarea,
  select {
    padding: 0.875rem;
    font-size: 0.95rem;
  }

  textarea {
    min-height: 100px;
  }

  .submit-button {
    width: 100%;
    min-width: auto;
    height: 48px;
    font-size: 1rem;
  }
}
</style>
