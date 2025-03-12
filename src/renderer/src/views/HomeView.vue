<script setup lang="ts">
import InfoCard from '@renderer/components/InfoCard.vue';
import ContactForm from '@renderer/components/ContactForm.vue';
import BolyFollowMouse from '@renderer/components/BolyFollowMouse.vue';
import { RouterLink } from 'vue-router';

import { ref } from 'vue';
import DataCard from '@renderer/components/DataCard.vue';

import { useI18n } from 'vue-i18n';

interface EChartsOption {
  tooltip?: {
    show?: boolean;
    trigger?: string;
    formatter?: string;
  };
  series?: Array<{
    name?: string;
    type?: string;
    radius?: string;
    center?: string;
    startAngle?: number;
    data?: Array<{
      value: number;
      name: string;
      selected?: boolean;
      label?: {
        position?: string;
        show?: boolean;
        formatter?: string;
        fontSize?: number;
        fontWeight?: string;
        color?: string;
      };
      show?: boolean;
    }>;
    color?: string[];
    itemStyle?: {
      borderRadius?: number;
      shadowColor?: string;
      shadowBlur?: number;
    };
    emphasis?: {
      itemStyle?: {
        shadowBlur?: number;
        shadowOffsetX?: number;
        shadowColor?: string;
        shadowOffsetY?: number;
      };
    };
  }>;
  backgroundColor?: string;
}

const { t } = useI18n();

const graphOption1 = ref<EChartsOption>({
  tooltip: {
    show: false,
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },

  series: [
    {
      name: 'Escuelas con laboratorios de ciencias',
      type: 'pie',
      radius: '90%',
      center: '50%',
      data: [
        {
          value: 88,
          name: t('home_graph1_data_title'),
          selected: true,
          label: {
            position: 'inside',
            show: true,
            formatter: '{c}%',
            fontSize: 18,
            fontWeight: '200',
            color: '#fff',
          }
        },
        {
          value: 12,
          name: 'With labs',
          label: { show: false },
          show: false
        },
      ],
      color: ['#BC3DE4', '#2aa9f3'],
      itemStyle: {
        borderRadius: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowOffsetY: 10,
        },

      },
    },
  ],
  backgroundColor: '#ffffff00',
});

const graphOption2 = ref<EChartsOption>({
  tooltip: {
    show: false,
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  series: [
    {
      name: 'Escuelas con laboratorios de ciencias',
      type: 'pie',
      radius: '90%',
      center: '50%',
      startAngle: 270,
      data: [
        {
          value: 92,
          name: t('home_graph2_data_title'),
          selected: true,
          label: {
            position: 'inside',
            show: true,
            formatter: '{c}%',
            fontSize: 18,
            fontWeight: '200',
            color: '#fff',
          }
        },
        {
          value: 12,
          name: 'With labs',
          label: { show: false },
        },
      ],
      color: ['#2aa9f3', '#BC3DE4'],
      itemStyle: {
        borderRadius: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowOffsetY: 10,
        },

      },
    },
  ],
  backgroundColor: '#ffffff00',
});
</script>

<template>
  <div class="section darkened">
    <div class="boly-container">
      <BolyFollowMouse />
    </div>
    <InfoCard :width="750" :img-size="500" class="home-title-card">
      <template #image>
        <!-- <img src="../assets/images/home2.png"> -->
      </template>
      <template #content>
        <h3>{{ $t('home_title1').toUpperCase() }}</h3>
        <h2>{{ $t('home_body1').toUpperCase() }}</h2>
      </template>
    </InfoCard>
  </div>
  <div class="section">
    <InfoCard :width="1200" :img-size="600">
      <template #content>
        <h3>{{ $t('home_title3').toUpperCase() }}</h3>
        <h2>{{ $t('home_body3').toUpperCase() }}</h2>
        <p>{{ $t('home_text3') }}</p>
      </template>
    </InfoCard>
  </div>
  <div class="section darkened">
    <h2 class="section-title">{{ $t('home_title2').toUpperCase() }}</h2>
    <DataCard :option="graphOption1">
      <template #text>
        <p class="section-text">
          {{ $t('home_graph1_data_text') }}
        </p>
      </template>
    </DataCard>
    <DataCard :option="graphOption2" :reversed="true">
      <template #text>
        <p class="section-text">
          {{ $t('home_graph2_data_text') }}
        </p>
      </template>
    </DataCard>
  </div>
  <div class="section contact-bg">
    <ContactForm />
  </div>
</template>

<style scoped>
.section {
  padding-bottom: 10px;
}
.darkened {
  background: rgb(57, 23, 117);
  background: linear-gradient(135deg, rgba(57, 23, 117, 1) 15%, rgba(0, 83, 205, 1) 98%);
}

.contact-bg {
  height: 800px;
  background-image: url("src/assets/images/fondo-xd.png");
  background-size: cover;
}

.button {
  padding-inline: 10px;
  height: 40px;
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: larger;
}

.boly-container {
  position: absolute;
  top: 150px;
  left: 30%; 
  width: 300px;
  height: 300px;
  z-index: 5;
}

h2 {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
  width: 60%;
}

.section-title {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
}

.section-text {
  text-align: left;
  font-size: 115%;
  margin: 40px;
  width: 80%;
}

.home-title-card {
  margin-left: auto;
}

</style>
