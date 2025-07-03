<script setup lang="ts">
import ReportProblemForm from '@/components/ReportProblemForm.vue'
</script>

<template>
    <div class="form-section">
        <div class="form-container">
            <h2 class="form-title">{{ $t('tell_us_what_happened') || 'Tell us what happened' }}</h2>
            <p class="form-description">{{ $t('report_problem_description') || 'Please provide as much detail as possible to help us resolve the issue quickly.' }}</p>
            <ReportProblemForm />
        </div>
    </div>
</template>

<style scoped>
.section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 60vh;
    padding: 1rem;
    margin-top: -95px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-wrapper {
    text-align: center;
    color: white;
    width: 100%;
}

.title {
    font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.1;
}

.subtitle {
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    opacity: 0.9;
    line-height: 1.4;
    padding: 0 1rem;
}

.form-section {
    background: white;
    padding: 2rem 1rem;
    min-height: 70vh;
}

.form-container {
    width: 100%;
    margin: 0 auto;
}

.form-title {
    font-family: 'Poppins', sans-serif;
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
    font-weight: bold;
}

.form-description {
    font-family: 'Poppins', sans-serif;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 2rem;
    color: #666;
    line-height: 1.5;
    padding: 0 1rem;
}
</style>
