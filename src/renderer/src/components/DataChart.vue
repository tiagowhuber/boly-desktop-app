<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
    CanvasRenderer,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
]);

const props = defineProps({
    option: Object,
});

</script>

<template>
    <VChart class="chart" :option="props.option" autoresize />
</template>

<style scoped>
.chart {
    width: 30vw;
    height: 30vh;
    background-color: transparent;
    margin-top: 20px;
    align-self: center;
}
</style>