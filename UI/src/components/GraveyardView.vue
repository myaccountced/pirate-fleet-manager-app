<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: GraveyardView.vue
 * http://localhost:5173/graveyard/
 */

import {onMounted, ref} from "vue";
import { useRouter } from "vue-router";
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';

const router = useRouter();
const toast = useToast();

const deceasedToDisplay = ref([]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(() => {
  const token = localStorage.getItem("token");

  if (token !== 'iHaveReadAccessLevel' && token !== 'iHaveWriteAccessLevel') {
    router.push('/');
  }

  getDeceased(); // Fetch the deceased members from the API, so it can be displayed in a table
})

// Get the list of deceased crew mates
const getDeceased = async () => {
  try {
    const response = await fetch(`http://localhost:3004/deceased/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const deceasedFromAPI = await response.json();
    // Dump the deceased members from the api to display on the page
    deceasedToDisplay.value = deceasedFromAPI;

    deceasedToDisplay.value = deceasedFromAPI.map(deceased => {
      const formattedDate = deceased.date ? deceased.date.slice(0, 10) : ''; // Slice to get YYYY-MM-DD
      return { ...deceased, date: formattedDate };
    });
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error fetching deceased', life: 6000});
    console.log(error);
  }
};
</script>

<template>
  <div class="graveyard">
    <Toast position="top-left" /> <!-- Show a toast at the top-left of the screen when specific actions are made -->

    <!-- Deceased table -->
    <DataTable :value="deceasedToDisplay" sortMode="multiple" striped-rows removable-sort tableStyle="min-width: 50rem"
               v-model:filters="filters" filterDisplay="row" :globalFilterFields="['ship']" class="deceased-table">
      <!-- Filter by ship using a search bar -->
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>🔍</InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Enter a ship name" />
          </IconField>
        </div>
      </template>

      <Column field="name" header="Name" sortable="" style="width: 25%"></Column>
      <Column field="crewType" header="Crew Type" sortable="" style="width: 15%"></Column>
      <Column field="causeOfDeath" header="Cause of Death" sortable="" style="width: 25%"></Column>
      <Column field="date" header="Date" sortable="" style="width: 20%"></Column>
      <Column field="ship" header="Ship" sortable="" style="width: 40%"></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.graveyard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/brook-bounty.jpg');
  background-size: contain;
  background-position: center center;
  font-size: medium;
}
.deceased-table {
  width: 150vh;
  margin: 1% 0 10% 0;
}
</style>