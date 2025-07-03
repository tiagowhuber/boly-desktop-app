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
    min-height: 50vh;
    padding: 2rem;
    margin-top: -115px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-wrapper {
    text-align: center;
    color: white;
    max-width: 800px;
}

.title {
    font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    font-size: 4rem;
    margin-bottom: 1rem;
    line-height: 1.1;
}

.subtitle {
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    line-height: 1.4;
}

.form-section {
    padding: 4rem 2rem;
    min-height: 80vh;
}

.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.form-title {
    font-family: 'Poppins', sans-serif;
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 1rem;
    font-weight: bold;
}

.form-description {
    font-family: 'Poppins', sans-serif;
    font-size: 1.1rem;
    text-align: center;
    margin-bottom: 3rem;
    line-height: 1.5;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 3rem;
}
</style>
