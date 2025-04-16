<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: FighterView.vue
 * http://localhost:5173/fighters/
 */

import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {valibotResolver} from '@primevue/forms/resolvers/valibot';
import * as v from 'valibot';
import {useToast} from 'primevue/usetoast';
import {FilterMatchMode} from '@primevue/core/api';
import blackPearl from '../assets/black-pearl.jpg'
import goingMerry from '../assets/going-merry.jpg'
import thousandSunny from '../assets/thousand-sunny.png'
import ShipComponent from "./ShipComponent.vue";

const router = useRouter();   // Used for routing
const toast = useToast();     // Used for alert for error and successful events
const isOpenAddFighterDialog = ref(false);    // Identify if the add fighter dialog box will be open or not
const isOpenDeathDialog = ref(false);         // Identify if the death dialog box will be open or not
const isOpenShipDialog = ref(false);          // Identify if the ship transfer dialog box will be open or not
const causeOfDeath = ref('');             // Cause of death of the current fighter being transferred to the graveyard
const dateOfDeath = ref();                      // Date of death of the current fighter being transferred to the graveyard
let selectedFighterId = '';                     // Current fighter that is selected in the table
const selectedShipId = ref(null);         // Ship that is selected in the transfer ship dialog box
const hasWriteAccessLevel = ref(false);   // Identify if the current user has a write access level

const fightersToDisplay = ref([]);        // List of fighters in the table
// Current fighter to be added
const fighterToAdd = ref({
  "name": "",
  "rank": "",
  "strength": null,
  "weapon": "",
  "ship": "",
});
// List of ships in the transfer ship dialog box
const shipItems = ref([
  {id: 0, name: "Black Pearl", img: blackPearl},
  {id: 1, name: "Thousand Sunny", img: thousandSunny},
  {id: 2, name: "Going Merry", img: goingMerry}
]);
const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
});

const ranks = ['Crew', 'Vice-Captain', 'Master-at-Arms'];         // List of ranks used in the Select in the add fighter dialog box
const ships = ['Black Pearl', 'Thousand Sunny', 'Going Merry'];   // List of ships used in the Select in the add fighter dialog box

onMounted(() => {
  const token = localStorage.getItem("token");

  // Check if the user is signed in, if they are, check if they have a write access level
  if (token !== 'iHaveReadAccessLevel' && token !== 'iHaveWriteAccessLevel') {
    router.push('/');
  }
  else if (token === 'iHaveWriteAccessLevel') {
    hasWriteAccessLevel.value = true;
  }

  getFighters(); // Fetch the fighters from the API, so it can be displayed in a table
})

// -------------- Validators --------------
const nameValidator = valibotResolver(
    v.pipe(
        v.string(),
        v.minLength(1, 'Name is required'),
        v.maxLength(30, 'Name must be at most 30 characters'),
        v.regex(/^[A-Z]/, 'First character must be capitalized') // Ensures the first character is uppercase
    )
);
const rankValidator = valibotResolver(v.pipe(v.string(), v.minLength(1, 'Rank is required')));
const strengthValidator = valibotResolver(
    v.pipe(
        v.number(value => 'Strength must be between 1 and 100'),
        v.minValue(1, 'Strength must be at least 1'),
        v.maxValue(100, 'Strength must be at most 100')
    )
);
const weaponValidator = valibotResolver(
    v.pipe(
        v.string(),
        v.minLength(1, 'Weapon is required'),
        v.maxLength(20, 'Weapon must be at most 20 characters'))
);
const shipValidator = valibotResolver(v.pipe(v.string(), v.minLength(1, 'Ship is required')));
const causeOfDeathValidator = valibotResolver(
    v.pipe(
        v.string(),
        v.minLength(1, 'Cause of death is required'),
        v.maxLength(30, 'Cause of death must be at most 30 characters'),
    )
);
const deathOfDeathValidator = valibotResolver(
    v.pipe(
        v.date(value => 'Choose a date'),
        v.minLength(1, 'Date is required'),
    )
);

// -------------- Methods --------------
// Add a fighter to the fighter list
const addFighter = async ({valid}) => {
  if (valid) {
    try {
      const response = await fetch(`http://localhost:3004/fighters/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(fighterToAdd.value),
        redirect: 'follow'
      });

      console.log(response);

      if (response.status === 201) {  // Success
        toast.add({severity: 'success', summary: 'A fighter has been added', life: 6000}); // Show a success toast
        await getFighters();      // Reload the table
        // Reset values of the form. Emptying out the inputs.
        fighterToAdd.value.name = '';
        fighterToAdd.value.rank = '';
        fighterToAdd.value.strength = null;
        fighterToAdd.value.weapon = '';
        fighterToAdd.value.ship = '';
        isOpenAddFighterDialog.value = false; // Close the add fighter dialog box
      }
      else {  // Failed
        const data = await response.json();

        // Extract and flatten all messages
        const messages = data
            .flatMap(item => item.message) // Flatten all message arrays
            .join('\n--> ');               // Combine messages into a single string

        // Show a failed toast
        toast.add({severity: 'error', summary: 'Adding the fighter failed', detail: '--> ' + messages, life: 20000});
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error adding the fighter. Try again later.', life: 6000});
      console.log(error);
    }
  }
};

// Get the list of fighters from the API
const getFighters = async () => {
  try {
    const response = await fetch(`http://localhost:3004/fighters/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    fightersToDisplay.value = await response.json(); // Dump the fighters from the api to display on the page
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error fetching fighters', life: 6000});
    console.log(error);
  }
};

// Remove the fighter from the fighter list
const deleteFighter = async (id) => {
  try {
    console.log(id);

    const response = await fetch(`http://localhost:3004/fighters/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    const message = data.message;

    if (response.status === 200) {
      toast.add({severity: 'success', summary: message, life: 6000});
      isOpenDeathDialog.value = true;   // Show the death dialog box
    }
    else if (response.status === 403 || response.status === 401) {
      toast.add({severity: 'error', summary: message, life: 6000});
    }
    else {
      toast.add({severity: 'error', summary: 'Error deleting the fighter. Try again later.', life: 6000});
    }
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error deleting the fighter', life: 6000});
    console.log(error);
  }
};

// Get the current date
const getCurrentDate = () => {
  return new Date();
}

// Handler for when a skull icon is clicked
const openDeathDialog = (id) => {
  isOpenDeathDialog.value = true; // Open the death dialog box
  causeOfDeath.value = '';        // Empty out the input
  dateOfDeath.value = null;       // Empty out the input
  selectedFighterId = id;         // Store the selected fighter's ID
}

// Handler for when an anchor icon is clicked
const openShipDialog = (id) => {
  isOpenShipDialog.value = true;  // Open the ship transfer dialog box
  selectedFighterId = id;         // Store the selected fighter's ID
  selectedShipId.value = null;
}

// Handler for when we close the add fighter dialog box
const closeAddFighterDialog = () => {
  isOpenAddFighterDialog.value = false; // Close the add fighter dialog box
  // Empty out the inputs
  fighterToAdd.value.name = '';
  fighterToAdd.value.rank = '';
  fighterToAdd.value.strength = null;
  fighterToAdd.value.weapon = '';
  fighterToAdd.value.ship = '';
}

// Move the fighter from the fighter list to the graveyard list.
// Runs when we hit Confirm button in the death dialog box.
const confirmDeathDialog = async ({valid}) => {
  if (valid) {
    try {
      const deceasedFighter = fightersToDisplay.value.filter(fighter => fighter.id === selectedFighterId);

      const response = await fetch(`http://localhost:3004/deceased/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: deceasedFighter[0].name,
          crewType: "Fighter",
          causeOfDeath: causeOfDeath.value,
          date: dateOfDeath.value,
          ship: deceasedFighter[0].ship
        })
      });

      if (response.status === 201) {
        toast.add({severity: 'success', summary: 'Successfully added the fighter into the graveyard', life: 6000});
        await deleteFighter(selectedFighterId); // Remove the fighter from the fighter list
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error adding the fighter to the graveyard', life: 6000});
      console.log(error);
    }

    isOpenDeathDialog.value = false;  // Close the death dialog box
    await getFighters();              // Update the fighter table
  }
}

// Identify the index of the ship currently selected/highlighted in the transfer ship dialog box
const selectShip = (shipInfo) => {
  selectedShipId.value = shipInfo.id;
}

// Transfer the fighter to a different ship
const transferShip = async (valid) => {
  if (valid) {
    try {
      const selectedFighter = fightersToDisplay.value.filter(fighter => fighter.id === selectedFighterId);

      const response = await fetch(`http://localhost:3004/fighters/${selectedFighterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: selectedFighter[0].id,
          name: selectedFighter[0].name,
          rank: selectedFighter[0].rank,
          strength: selectedFighter[0].strength,
          weapon: selectedFighter[0].weapon,
          ship: shipItems.value.find(ship => ship.id === selectedShipId.value)?.name
        })
      });

      if (response.status === 200) {
        toast.add({severity: 'success', summary: 'The fighter has been transferred', life: 6000});
        await getFighters();  // Update the fighter table
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error ship transfer. Try again later.', life: 6000});
      console.log(error);
    }

    isOpenShipDialog.value = false; // Close the transfer ship dialog box
  }
  else {
    toast.add({severity: 'error', summary: 'Please select a ship!', life: 6000});
  }
}
</script>

<template>
  <div class="fighter">
    <h1>Available Fighters</h1>

    <Toast position="top-left"/> <!-- Show a toast at the top-left of the screen when specific actions are made -->

    <!-- Add a fighter button -->
    <Button type="submit" severity="secondary" label="⚔ Add a fighter" size="large"
            @click="isOpenAddFighterDialog = true" v-if="hasWriteAccessLevel" />

    <!-- Add a fighter dialog box -->
    <Dialog v-model:visible="isOpenAddFighterDialog" header="Enter fighter information" :modal="true"
            :closable="false" :style="{ width: '400px' }">
      <Form :initialValues :resolver @submit="addFighter">
        <FormField v-slot="$field" name="name" initialValue="" :resolver="nameValidator" class="add-fighter-form-children">
          <InputGroup>
            <InputGroupAddon>🏴‍☠️</InputGroupAddon>
            <InputText v-model="fighterToAdd.name" placeholder="Name" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="rank" initialValue="" :resolver="rankValidator" class="add-fighter-form-children">
          <InputGroup>
            <InputGroupAddon>👑</InputGroupAddon>
            <Select v-model="fighterToAdd.rank" :options="ranks" placeholder="Select a Rank" checkmark
                    :highlightOnSelect="false" class="w-full md:w-56" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="strength" :resolver="strengthValidator" class="add-fighter-form-children">
          <InputNumber v-model="fighterToAdd.strength" inputId="horizontal-buttons" size="large"
                       showButtons buttonLayout="horizontal" :step="1" :min="1" :max="100" placeholder="Strength">
            <template #incrementbuttonicon>💪</template>
            <template #decrementbuttonicon>🦴</template>
          </InputNumber>
          <br/>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="weapon" initialValue="" :resolver="weaponValidator" class="add-fighter-form-children">
          <InputGroup>
            <InputGroupAddon>⚔️️</InputGroupAddon>
            <InputText v-model="fighterToAdd.weapon" placeholder="Weapon" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="ship" initialValue="" :resolver="shipValidator" class="add-fighter-form-children">
          <InputGroup>
            <InputGroupAddon>🚢</InputGroupAddon>
            <Select v-model="fighterToAdd.ship" :options="ships" placeholder="Select a Ship" checkmark
                    :highlightOnSelect="false" class="w-full md:w-56" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}
          </Message>
        </FormField>

        <Button label="Cancel" class="p-button-text" @click="closeAddFighterDialog" size="large" />
        <Button type="submit" severity="secondary" label="✅ Submit" size="large" />
      </Form>
    </Dialog>

    <!-- Fighters table -->
    <DataTable :value="fightersToDisplay" sortMode="multiple" striped-rows removable-sort tableStyle="min-width: 50rem"
               v-model:filters="filters" filterDisplay="row" :globalFilterFields="['ship']" class="fighter-table" :size="'large'">
      <!-- Filter by ship using a search bar -->
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>🔍</InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Enter a ship name"/>
          </IconField>
        </div>
      </template>

      <!-- Skull icon in every row -->
      <Column field="id" header="" style="width: 0">
        <template #body="slotProps">
          <div>
            <Button type="submit" severity="danger" label="💀" size="large"
                    @click="openDeathDialog(slotProps.data.id)" v-if="hasWriteAccessLevel" />
          </div>

          <!-- Death dialog box -->
          <Dialog v-model:visible="isOpenDeathDialog" header="Enter cause and date of death" :modal="true"
                  :closable="false" :style="{ width: '400px' }">
            <Form :initialValues :resolver @submit="confirmDeathDialog" class="flex flex-col gap-4 w-full sm:w-80">
              <FormField v-slot="$field" name="causeOfDeath" initialValue="" :resolver="causeOfDeathValidator"
                         class="skull-form-children">
                <InputGroup>
                  <InputGroupAddon>💀</InputGroupAddon>
                  <InputText v-model="causeOfDeath" placeholder="Cause of Death" size="large" />
                </InputGroup>
                <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
              </FormField>

              <FormField v-slot="$field" name="dateOfDeath" initialValue="" :resolver="deathOfDeathValidator"
                         class="skull-form-children">
                <InputGroup>
                  <InputGroupAddon>📅</InputGroupAddon>
                  <DatePicker v-model="dateOfDeath" date-format="yy/mm/dd" :max-date="getCurrentDate()" show-button-bar
                              fluid size="large" placeholder="Date of death" />
                </InputGroup>
                <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
              </FormField>

              <div class="flex justify-end">
                <Button label="Cancel" class="p-button-text" @click="isOpenDeathDialog = false" size="large" />
                <Button type="submit" label="Confirm" class="p-button-danger" size="large" />
              </div>
            </Form>
          </Dialog>
        </template>
      </Column>

      <Column field="name" header="Name" sortable="" style="width: 25%"></Column>
      <Column field="rank" header="Rank" sortable="" style="width: 25%"></Column>
      <Column field="strength" header="Strength" sortable="" style="width: 15%"></Column>
      <Column field="weapon" header="Weapon" sortable="" style="width: 20%"></Column>
      <Column field="ship" header="Ship" sortable="" style="width: 40%"></Column>

      <!-- Anchor icon in every row -->
      <Column field="id" header="" style="width: 0">
        <template #body="slotProps">
          <div>
            <Button type="submit" severity="secondary" label="⚓" size="large"
                    @click="openShipDialog(slotProps.data.id)" v-if="hasWriteAccessLevel" />
          </div>

          <!-- Ship transfer dialog box -->
          <Dialog v-model:visible="isOpenShipDialog" header="Select a ship" :modal="true" :closable="false"
                  class="flex flex-col gap-4 w-full sm:w-80">
            <Form :initialValues :resolver @submit="transferShip(selectedShipId != null)"
                  class="flex flex-col gap-4 w-full sm:w-80">

              <!-- Show the three ships that you can select -->
              <div class="flex flex-wrap justify-center items-center gap-4">
                <ShipComponent v-for="ship in shipItems"
                               :id="ship.id" :name="ship.name" :img="ship.img"
                               :is-selected="ship.id === selectedShipId" @shipInfo="selectShip">
                </ShipComponent>
              </div>

              <div class="flex justify-end">
                <Button label="Cancel" severity="secondary" @click="isOpenShipDialog = false"/>
                <Button type="submit" label="Confirm" severity="success"/>
              </div>
            </Form>
          </Dialog>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.fighter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/zoro-bounty.png');
  background-size: contain;
  background-position: center center;
  font-size: medium;
}
.fighter-table {
  width: 150vh;
  margin: 1% 0 10% 0;
}
.add-fighter-form-children {
  margin: 3% 0 3% 0;
}
.skull-form-children {
  margin: 3% 0 3% 0;
}
h1 {
  background-color: #118056;
  color: white;
  padding: 0 .5% 0 .5%;
  border-radius: 15px;
}
</style>