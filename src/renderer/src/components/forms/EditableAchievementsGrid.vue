<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: Array,
  columns: Array,
  columnNames: Object,
  filterKey: String,
  locale: String
})

const sortKey = ref('')
const sortOrders = ref(
  props.columns.reduce((o, key) => ((o[key] = 1), o), {})
)

const filteredData = computed(() => {
  let { data, filterKey } = props
  let excludeKeys = ['id', 'gameId', 'secret']

  if (filterKey) {
    filterKey = filterKey.toLowerCase()
    data = data.filter((row) => {
      return Object.keys(row).some((key) => {
        if(key == 'name' || key == 'description'){
          return String(row[key][props.locale]).toLowerCase().indexOf(filterKey) > -1 && !excludeKeys.includes(key)
        }
        else{
          return String(row[key]).toLowerCase().indexOf(filterKey) > -1 && !excludeKeys.includes(key)
        }
      })
    })
  }

  //Sorting
  const key = sortKey.value
  if(key == 'unlock_requirement'){
    const order = sortOrders.value[key]
    data = data.slice().sort((a, b) => {
      a = a['type'] == 'INSTANT'? 0 : a[key]
      b = b['type'] == 'INSTANT'? 0 : b[key]
      return (a === b ? 0 : a > b ? 1 : -1) * order
    })
  }
  else if(key === 'name' || key === 'description'){
    const order = sortOrders.value[key]
    data = data.slice().sort((a, b) => {
      a = a[key][props.locale]
      b = b[key][props.locale]
      return (a === b ? 0 : a > b ? 1 : -1) * order
    })
  }
  else if (key) {
    const order = sortOrders.value[key]
    data = data.slice().sort((a, b) => {
      a = a[key]
      b = b[key]
      return (a === b ? 0 : a > b ? 1 : -1) * order
    })
  }

  return data
})

function sortBy(key) {
  sortKey.value = key
  sortOrders.value[key] *= -1
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="key in columns"
          @click="sortBy(key)"
          :class="{ active: sortKey == key }"
          :key="key"
        >
          <template v-if="key == 'name' || key == 'description'">{{ $t(columnNames[key]) }} ({{ locale.toUpperCase() }})</template>
          <template v-else>{{ $t(columnNames[key]) }}</template>
          <span class="arrow" :class="sortOrders[key] > 0 ? 'asc' : 'dsc'"></span>
        </th>

        <th> {{$t('remove')}} </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in filteredData" :key="entry.id">
        <td v-for="key in columns" :key="key">
          <template v-if="key === 'secret'">
            <input class="lock" type="checkbox" v-model="entry[key]"/>
          </template>
          <template v-else-if="key === 'unlock_requirement'">
            <input type="number" v-model="entry[key]" v-if="entry.type == 'PROGRESS'" />
            <input type="text" value="N/A" v-else :disabled="true"/>
          </template>
          <template v-else-if="key === 'type'">
            <select class="table-option" v-model="entry[key]">
              <option value="PROGRESS" class="table-option">{{$t('progress')}}</option>
              <option value="INSTANT"  class="table-option">{{$t('instant')}}</option>
            </select>
          </template>
          <template v-else-if="key === 'name' || key === 'description'">
            <input type="text" v-model="entry[key][locale]" />
          </template>
          <template v-else-if="key === 'achievement_code'">
            <input type="text" v-model="entry[key]" />
          </template>
          <!-- Read-only fields -->
          <template v-else>
            {{ entry[key] }}
          </template>
        </td>
        <!-- Add a save button to submit changes -->
        <td>
          <button class="btn-remove remove-button" @click="$emit('remove-achievement', entry.id)">{{$t('remove')}}</button>
        </td>
      </tr>
      <tr> 
        <button class="btn-blue add-button" @click="$emit('add-achievement')">+ {{$t('add_achievement')}}</button></tr>
    </tbody>
  </table>
</template>

<style scoped>

.add-button{
  width: 200px;
  margin-top: 10px;
  border-radius: 10px;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 100%;
  color: var(--light);
}

.remove-button{
  border-radius: 10px;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 100%;
  color: var(--light);
}

table{
  border-spacing: 0px;
}

th {
  background-color: var(--boly-button-blue);
  border: solid 2px rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  user-select: none;
  padding: 10px;
}

td {
  border: solid 2px rgba(255, 255, 255, 0.25);
  background-color: var(--boly-bg-dark-transparent);
}

th,
td {
  min-width: 120px;
}

th.active {
  background-color: var(--boly-button-blue-hover);
  color: #fff;
}

th.active .arrow {
  opacity: 1;
}

.lock{
  width: 40%;
  scale: 2;
}

input {
  font-size: 80%;
  background: none;
  border: none;
  padding: 10px;
  width: 100%;
  height: 100%;
  color: var(--light);
}

button, select{
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 40px;
  border: none;
}

select{
  color: var(--light);
  background-color: transparent;
}

select .table-option{
  color: var(--light);
  background-color: var(--boly-bg-dark);
}

.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  opacity: 0.66;
}

.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #fff;
}

.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #fff;
}

</style>