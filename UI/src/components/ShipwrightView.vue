<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: ShipwrightView.vue
 * http://localhost:5173/shipwrights/
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

const router = useRouter();     // Used for routing
const toast = useToast();       // Used for alert for error and successful events
const isOpenAddShipwrightDialog = ref(false);    // Identify if the add shipwright dialog box will be open or not
const isOpenDeathDialog = ref(false);         // Identify if the death dialog box will be open or not
const isOpenShipDialog = ref(false);          // Identify if the ship transfer dialog box will be open or not
const causeOfDeath = ref('');             // Cause of death of the current shipwright being transferred to the graveyard
const dateOfDeath = ref();                      // Date of death of the current shipwright being transferred to the graveyard
let selectedShipwrightId = '';                     // Current shipwright that is selected in the table
const selectedShipId = ref(null);         // Ship that is selected in the transfer ship dialog box
const hasWriteAccessLevel = ref(false);   // Identify if the current user has a write access level

const shipwrightsToDisplay = ref([]);        // List of shipwrights in the table
// Current shipwright to be added
const shipwrightToAdd = ref({
  "name": "",
  "totalHoursWorked": null,
  "yearsOfExp": null,
  "favTool": "",
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

const ships = ['Black Pearl', 'Thousand Sunny', 'Going Merry'];   // List of ships used in the Select in the add shipwright dialog box

onMounted(() => {
  const token = localStorage.getItem("token");

  // Check if the user is signed in, if they are, check if they have a write access level
  if (token !== 'iHaveReadAccessLevel' && token !== 'iHaveWriteAccessLevel') {
    router.push('/');
  }
  else if (token === 'iHaveWriteAccessLevel') {
    hasWriteAccessLevel.value = true;
  }

  getShipwrights(); // Fetch the shipwrights from the API, so it can be displayed in a table
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
const totalHoursWorkedValidator = valibotResolver(
    v.pipe(
        v.number(value => 'Total hours worked must be between 1 and 25000'),
        v.minValue(1, 'Total hours worked must be at least 1 hour'),
        v.maxValue(25000, 'Total hours worked must be at most 25000 hours')
    )
);
const yearsOfExpValidator = valibotResolver(
    v.pipe(
        v.number(value => 'Years of experience must be between 1 and 50'),
        v.minValue(1, 'Years of experience must be at least 1 year. Not enough experience!'),
        v.maxValue(50, 'Years of experience must be at most 50 years, we do not need an old man for a physically demanding job')
    )
);
const favToolValidator = valibotResolver(
    v.pipe(
        v.string(),
        v.minLength(1, 'Favourite tool is required'),
        v.maxLength(20, 'Favourite tool must be at most 20 characters'))
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
// Add a shipwright to the shipwright list
const addShipwright = async ({valid}) => {
  if (valid) {
    try {
      const response = await fetch(`http://localhost:3004/shipwrights/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(shipwrightToAdd.value),
        redirect: 'follow'
      });

      console.log(response);

      if (response.status === 201) {  // Success
        toast.add({severity: 'success', summary: 'A shipwright has been added', life: 6000}); // Show a success toast
        await getShipwrights();      // Reload the table
        // Reset values of the form. Emptying out the inputs.
        shipwrightToAdd.value.name = '';
        shipwrightToAdd.value.totalHoursWorked = null;
        shipwrightToAdd.value.yearsOfExp = null;
        shipwrightToAdd.value.favTool = '';
        shipwrightToAdd.value.ship = '';
        isOpenAddShipwrightDialog.value = false;  // Close the add shipwright dialog box
      }
      else {  // Failed
        const data = await response.json();

        // Extract and flatten all messages
        const messages = data
            .flatMap(item => item.message) // Flatten all message arrays
            .join('\n--> ');               // Combine messages into a single string

        // Show a failed toast
        toast.add({severity: 'error', summary: 'Adding the shipwright failed', detail: '--> ' + messages, life: 20000});
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error adding the shipwright. Try again later.', life: 6000});
      console.log(error);
    }
  }
};

// Get the list of shipwrights from the API
const getShipwrights = async () => {
  try {
    const response = await fetch(`http://localhost:3004/shipwrights/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    shipwrightsToDisplay.value = await response.json(); // Dump the shipwrights from the api to display on the page
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error fetching shipwrights', life: 6000});
    console.log(error);
  }
};

// Remove the shipwright from the shipwright list
const deleteShipwright = async (id) => {
  try {
    const response = await fetch(`http://localhost:3004/shipwrights/${id}`, {
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
      toast.add({severity: 'error', summary: 'Error deleting the shipwright. Try again later.', life: 6000});
    }
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error deleting the shipwright', life: 6000});
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
  selectedShipwrightId = id;      // Store the selected shipwright's ID
}

// Handler for when an anchor icon is clicked
const openShipDialog = (id) => {
  isOpenShipDialog.value = true;  // Open the ship transfer dialog box
  selectedShipwrightId = id;      // Store the selected shipwright's ID
  selectedShipId.value = null;
}

// Handler for when we close the add shipwright dialog box
const closeAddShipwrightDialog = () => {
  isOpenAddShipwrightDialog.value = false; // Close the add shipwright dialog box
  // Empty out the inputs
  shipwrightToAdd.value.name = '';
  shipwrightToAdd.value.totalHoursWorked = null;
  shipwrightToAdd.value.yearsOfExp = null;
  shipwrightToAdd.value.favTool = '';
  shipwrightToAdd.value.ship = '';
}

// Move the shipwright from the shipwright list to the graveyard list.
// Runs when we hit Confirm button in the death dialog box.
const confirmDeathDialog = async ({valid}) => {
  if (valid) {
    try {
      const deceasedShipwright = shipwrightsToDisplay.value.filter(shipwright => shipwright.id === selectedShipwrightId);

      const response = await fetch(`http://localhost:3004/deceased/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: deceasedShipwright[0].name,
          crewType: "Shipwright",
          causeOfDeath: causeOfDeath.value,
          date: dateOfDeath.value,
          ship: deceasedShipwright[0].ship
        })
      });

      if (response.status === 201) {
        toast.add({severity: 'success', summary: 'Successfully added the shipwright into the graveyard', life: 6000});
        await deleteShipwright(selectedShipwrightId); // Remove the shipwright from the shipwright list
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error adding the shipwright to the graveyard', life: 6000});
      console.log(error);
    }

    isOpenDeathDialog.value = false;  // Close the death dialog box
    await getShipwrights();              // Update the shipwright table
  }
}

// Identify the index of the ship currently selected/highlighted in the transfer ship dialog box
const selectShip = (shipInfo) => {
  selectedShipId.value = shipInfo.id;
}

// Transfer the shipwright to a different ship
const transferShip = async (valid) => {
  if (valid) {
    try {
      const selectedShipwright = shipwrightsToDisplay.value.filter(shipwright => shipwright.id === selectedShipwrightId);

      const response = await fetch(`http://localhost:3004/shipwrights/${selectedShipwrightId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: selectedShipwright[0].id,
          name: selectedShipwright[0].name,
          totalHoursWorked: selectedShipwright[0].totalHoursWorked,
          yearsOfExp: selectedShipwright[0].yearsOfExp,
          favTool: selectedShipwright[0].favTool,
          ship: shipItems.value.find(ship => ship.id === selectedShipId.value)?.name
        })
      });

      if (response.status === 200) {
        toast.add({severity: 'success', summary: 'The shipwright has been transferred', life: 6000});
        await getShipwrights();  // Update the shipwright table
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
  <div class="shipwright">
    <h1>Available Shipwrights</h1>

    <Toast position="top-left"/> <!-- Show a toast at the top-left of the screen when specific actions are made -->

    <!-- Add a shipwright button -->
    <Button type="submit" severity="secondary" label="⚒️ Add a shipwright" size="large"
            @click="isOpenAddShipwrightDialog = true" v-if="hasWriteAccessLevel" />

    <!-- Add a shipwright dialog box -->
    <Dialog v-model:visible="isOpenAddShipwrightDialog" header="Enter shipwright information" :modal="true"
            :closable="false" :style="{ width: '400px' }">
      <Form :initialValues :resolver @submit="addShipwright">
        <FormField v-slot="$field" name="name" initialValue="" :resolver="nameValidator" class="add-shipwright-form-children">
          <InputGroup>
            <InputGroupAddon>🏴‍☠️</InputGroupAddon>
            <InputText v-model="shipwrightToAdd.name" placeholder="Name" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="totalHoursWorked" :resolver="totalHoursWorkedValidator" class="add-shipwright-form-children">
          <InputNumber v-model="shipwrightToAdd.totalHoursWorked" inputId="horizontal-buttons" size="large"
                       showButtons buttonLayout="horizontal" :step="1" :min="1" :max="25000" placeholder="Total hours worked">
            <template #incrementbuttonicon>👆</template>
            <template #decrementbuttonicon>👇</template>
          </InputNumber>
          <br/>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="yearsOfExp" :resolver="yearsOfExpValidator" class="add-shipwright-form-children">
          <InputNumber v-model="shipwrightToAdd.yearsOfExp" inputId="horizontal-buttons" size="large"
                       showButtons buttonLayout="horizontal" :step="1" :min="1" :max="50" placeholder="Years of experience">
            <template #incrementbuttonicon>🧠</template>
            <template #decrementbuttonicon>🥔</template>
          </InputNumber>
          <br/>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="favTool" initialValue="" :resolver="favToolValidator" class="add-shipwright-form-children">
          <InputGroup>
            <InputGroupAddon>🔨</InputGroupAddon>
            <InputText v-model="shipwrightToAdd.favTool" placeholder="Favourite tool" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="ship" initialValue="" :resolver="shipValidator" class="add-shipwright-form-children">
          <InputGroup>
            <InputGroupAddon>🚢</InputGroupAddon>
            <Select v-model="shipwrightToAdd.ship" :options="ships" placeholder="Select a Ship" checkmark
                    :highlightOnSelect="false" class="w-full md:w-56" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}
          </Message>
        </FormField>

        <Button label="Cancel" class="p-button-text" @click="closeAddShipwrightDialog" size="large" />
        <Button type="submit" severity="secondary" label="✅ Submit" size="large" />
      </Form>
    </Dialog>

    <!-- Shipwrights table -->
    <DataTable :value="shipwrightsToDisplay" sortMode="multiple" striped-rows removable-sort tableStyle="min-width: 50rem"
               v-model:filters="filters" filterDisplay="row" :globalFilterFields="['ship']" class="shipwright-table" :size="'large'">
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

      <Column field="name" header="Name" sortable="" style="width: 20%"></Column>
      <Column field="totalHoursWorked" header="Total Hours Worked" sortable="" style="width: 20%"></Column>
      <Column field="yearsOfExp" header="Years of Experience" sortable="" style="width: 20%"></Column>
      <Column field="favTool" header="Favourite Tool" sortable="" style="width: 20%"></Column>
      <Column field="ship" header="Ship" sortable="" style="width: 20%"></Column>

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
.shipwright {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/franky-bounty.jpg');
  background-size: contain;
  background-position: center center;
  font-size: medium;
}
.shipwright-table {
  width: 150vh;
  margin: 1% 0 10% 0;
}
.add-shipwright-form-children {
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