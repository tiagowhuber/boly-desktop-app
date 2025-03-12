<script lang="ts" setup>
import DataChart from './DataChart.vue';

const { option, reversed } = defineProps({
    option: Object,
    reversed: Boolean
})
</script>

<template>
    <div v-if="!reversed" class="card">
        <slot name="text"></slot>
        <DataChart :option="option" />
    </div>
    <div v-else class="card">
        <DataChart :option="option" />
        <slot name="text"></slot>    
    </div>
</template>

<style scoped>
.card {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    background-color: #221742a9;
    border-radius: 20px;
    gap: 0px;
}
</style>