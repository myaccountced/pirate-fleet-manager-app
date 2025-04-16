<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: DoctorView.vue
 * http://localhost:5173/doctors/
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
const isOpenAddDoctorDialog = ref(false); // Identify if the add doctor dialog box will be open or not
const isOpenDeathDialog = ref(false);     // Identify if the death dialog box will be open or not
const isOpenShipDialog = ref(false);      // Identify if the ship transfer dialog box will be open or not
const causeOfDeath = ref('');             // Cause of death of the current doctor being transferred to the graveyard
const dateOfDeath = ref();                      // Date of death of the current doctor being transferred to the graveyard
let selectedDoctorId = '';                      // Current doctor that is selected in the table
const selectedShipId = ref(null);         // Ship that is selected in the transfer ship dialog box
const hasWriteAccessLevel = ref(false);   // Identify if the current user has a write access level

const doctorsToDisplay = ref([]);         // List of doctors in the table
// Current doctor to be added
const doctorToAdd = ref({
  "name": "",
  "age": null,
  "speciality": "",
  "yearsOfExp": null,
  "favRemedy": "",
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

const ships = ['Black Pearl', 'Thousand Sunny', 'Going Merry'];   // List of ships used in the Select in the add doctor dialog box

onMounted(() => {
  const token = localStorage.getItem("token");

  // Check if the user is signed in, if they are, check if they have a write access level
  if (token !== 'iHaveReadAccessLevel' && token !== 'iHaveWriteAccessLevel') {
    router.push('/');
  }
  else if (token === 'iHaveWriteAccessLevel') {
    hasWriteAccessLevel.value = true;
  }

  getDoctors(); // Fetch the doctors from the API, so it can be displayed in a table
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
const ageValidator = valibotResolver(
    v.pipe(
        v.number(value => 'Age must be between 20 and 70'),
        v.minValue(20, 'Age must be at least 20 years old. Too young'),
        v.maxValue(70, 'Age must be at most 70 years old. Please retire')
    )
);
const specialityValidator = valibotResolver(
    v.pipe(
        v.string(),
        v.minLength(1, 'Speciality is required'),
        v.maxLength(20, 'Speciality must be at most 20 characters'))
);
const yearsOfExpValidator = valibotResolver(
    v.pipe(
        v.number(value => 'Years of experience must be between 30 and 70'),
        v.minValue(2, 'Years of experience must be at least 2 years. Not enough experience!'),
        v.maxValue(50, 'Years of experience must be at most 50 years. Please retire')
    )
);
const favRemedyValidator = valibotResolver(
    v.pipe(
        v.string(),
        v.minLength(1, 'Favourite remedy is required'),
        v.maxLength(20, 'Favourite remedy must be at most 20 characters'))
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
// Add a doctor to the doctor list
const addDoctor = async ({valid}) => {
  if (valid) {
    try {
      const response = await fetch(`http://localhost:3004/doctors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(doctorToAdd.value),
        redirect: 'follow'
      });

      console.log(response);

      if (response.status === 201) {  // Success
        toast.add({severity: 'success', summary: 'A doctor has been added', life: 6000}); // Show a success toast
        await getDoctors();      // Reload the table
        // Reset values of the form. Emptying out the inputs.
        doctorToAdd.value.name = '';
        doctorToAdd.value.age = null;
        doctorToAdd.value.speciality = '';
        doctorToAdd.value.yearsOfExp = null;
        doctorToAdd.value.favRemedy = '';
        doctorToAdd.value.ship = '';
        isOpenAddDoctorDialog.value = false;  // Close the add doctor dialog box
      }
      else {  // Failed
        const data = await response.json();

        // Extract and flatten all messages
        const messages = data
            .flatMap(item => item.message) // Flatten all message arrays
            .join('\n--> ');               // Combine messages into a single string

        // Show a failed toast
        toast.add({severity: 'error', summary: 'Adding the doctor failed', detail: '--> ' + messages, life: 20000});
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error adding the doctor. Try again later.', life: 6000});
      console.log(error);
    }
  }
};

// Get the list of doctors from the API
const getDoctors = async () => {
  try {
    const response = await fetch(`http://localhost:3004/doctors/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    doctorsToDisplay.value = await response.json(); // Dump the doctors from the api to display on the page
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error fetching doctors', life: 6000});
    console.log(error);
  }
};

// Remove the doctor from the doctor list
const deleteDoctor = async (id) => {
  try {
    console.log(id);

    const response = await fetch(`http://localhost:3004/doctors/${id}`, {
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
      toast.add({severity: 'error', summary: 'Error deleting the doctor. Try again later.', life: 6000});
    }
  }
  catch (error) {
    toast.add({severity: 'error', summary: 'Error deleting the doctor', life: 6000});
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
  selectedDoctorId = id;         // Store the selected doctor's ID
}

// Handler for when an anchor icon is clicked
const openShipDialog = (id) => {
  isOpenShipDialog.value = true;  // Open the ship transfer dialog box
  selectedDoctorId = id;          // Store the selected doctor's ID
  selectedShipId.value = null;
}

// Handler for when we close the add doctor dialog box
const closeAddDoctorDialog = () => {
  isOpenAddDoctorDialog.value = false; // Close the add doctor dialog box
  // Empty out the inputs
  doctorToAdd.value.name = '';
  doctorToAdd.value.age = null;
  doctorToAdd.value.speciality = '';
  doctorToAdd.value.yearsOfExp = null;
  doctorToAdd.value.favRemedy = '';
  doctorToAdd.value.ship = '';
}

// Move the doctor from the doctor list to the graveyard list.
// Runs when we hit Confirm button in the death dialog box.
const confirmDeathDialog = async ({valid}) => {
  if (valid) {
    try {
      const deceasedDoctor = doctorsToDisplay.value.filter(doctor => doctor.id === selectedDoctorId);

      const response = await fetch(`http://localhost:3004/deceased/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: deceasedDoctor[0].name,
          crewType: "Doctor",
          causeOfDeath: causeOfDeath.value,
          date: dateOfDeath.value,
          ship: deceasedDoctor[0].ship
        })
      });

      if (response.status === 201) {
        toast.add({severity: 'success', summary: 'Successfully added the doctor into the graveyard', life: 6000});
        await deleteDoctor(selectedDoctorId); // Remove the doctor from the doctor list
      }
    }
    catch (error) {
      toast.add({severity: 'error', summary: 'Error adding the doctor to the graveyard', life: 6000});
      console.log(error);
    }

    isOpenDeathDialog.value = false;  // Close the death dialog box
    await getDoctors();               // Update the doctor table
  }
}

// Identify the index of the ship currently selected/highlighted in the transfer ship dialog box
const selectShip = (shipInfo) => {
  selectedShipId.value = shipInfo.id;
}

// Transfer the doctor to a different ship
const transferShip = async (valid) => {
  if (valid) {
    try {
      const selectedDoctor = doctorsToDisplay.value.filter(doctor => doctor.id === selectedDoctorId);

      const response = await fetch(`http://localhost:3004/doctors/${selectedDoctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: selectedDoctor[0].id,
          name: selectedDoctor[0].name,
          age: selectedDoctor[0].age,
          speciality: selectedDoctor[0].speciality,
          yearsOfExp: selectedDoctor[0].yearsOfExp,
          favRemedy: selectedDoctor[0].favRemedy,
          ship: shipItems.value.find(ship => ship.id === selectedShipId.value)?.name
        })
      });

      if (response.status === 200) {
        toast.add({severity: 'success', summary: 'The doctor has been transferred', life: 6000});
        await getDoctors();  // Update the doctor table
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
  <div class="doctor">
    <h1>Available Doctors</h1>

    <Toast position="top-left"/> <!-- Show a toast at the top-left of the screen when specific actions are made -->

    <!-- Add a doctor button -->
    <Button type="submit" severity="secondary" label="⚕️ Add a doctor" size="large"
            @click="isOpenAddDoctorDialog = true" v-if="hasWriteAccessLevel" />

    <!-- Add a doctor dialog box -->
    <Dialog v-model:visible="isOpenAddDoctorDialog" header="Enter doctor information" :modal="true"
            :closable="false" :style="{ width: '400px' }">
      <Form :initialValues :resolver @submit="addDoctor">
        <FormField v-slot="$field" name="name" initialValue="" :resolver="nameValidator" class="add-doctor-form-children">
          <InputGroup>
            <InputGroupAddon>🏴‍☠️</InputGroupAddon>
            <InputText v-model="doctorToAdd.name" placeholder="Name" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="age" :resolver="ageValidator" class="add-doctor-form-children">
          <InputNumber v-model="doctorToAdd.age" inputId="horizontal-buttons" size="large"
                       showButtons buttonLayout="horizontal" :step="1" :min="20" :max="70" placeholder="Age">
            <template #incrementbuttonicon>🩼</template>
            <template #decrementbuttonicon>🍼</template>
          </InputNumber>
          <br/>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="speciality" initialValue="" :resolver="specialityValidator" class="add-doctor-form-children">
          <InputGroup>
            <InputGroupAddon>️🥼</InputGroupAddon>
            <InputText v-model="doctorToAdd.speciality" placeholder="Speciality" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="yearsOfExp" :resolver="yearsOfExpValidator" class="add-doctor-form-children">
          <InputNumber v-model="doctorToAdd.yearsOfExp" inputId="horizontal-buttons" size="large"
                       showButtons buttonLayout="horizontal" :step="1" :min="2" :max="50" placeholder="Years of experience">
            <template #incrementbuttonicon>🧠</template>
            <template #decrementbuttonicon>🥔</template>
          </InputNumber>
          <br/>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="favRemedy" initialValue="" :resolver="favRemedyValidator" class="add-doctor-form-children">
          <InputGroup>
            <InputGroupAddon>💉️</InputGroupAddon>
            <InputText v-model="doctorToAdd.favRemedy" placeholder="Favourite remedy" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}</Message>
        </FormField>

        <FormField v-slot="$field" name="ship" initialValue="" :resolver="shipValidator" class="add-doctor-form-children">
          <InputGroup>
            <InputGroupAddon>🚢</InputGroupAddon>
            <Select v-model="doctorToAdd.ship" :options="ships" placeholder="Select a Ship" checkmark
                    :highlightOnSelect="false" class="w-full md:w-56" size="large" />
          </InputGroup>
          <Message v-if="$field?.invalid" severity="error" size="large">{{ $field.error?.message }}
          </Message>
        </FormField>

        <Button label="Cancel" class="p-button-text" @click="closeAddDoctorDialog" size="large" />
        <Button type="submit" severity="secondary" label="✅ Submit" size="large" />
      </Form>
    </Dialog>

    <!-- Doctors table -->
    <DataTable :value="doctorsToDisplay" sortMode="multiple" striped-rows removable-sort tableStyle="min-width: 50rem"
               v-model:filters="filters" filterDisplay="row" :globalFilterFields="['ship']" class="doctor-table" :size="'large'">
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

      <Column field="name" header="Name" sortable="" style="width: 19%"></Column>
      <Column field="age" header="Age" sortable="" style="width: 13%"></Column>
      <Column field="speciality" header="Speciality" sortable="" style="width: 16%"></Column>
      <Column field="yearsOfExp" header="Years of Experience" sortable="" style="width: 13%"></Column>
      <Column field="favRemedy" header="Favourite Remedy" sortable="" style="width: 16%"></Column>
      <Column field="ship" header="Ship" sortable="" style="width: 19%"></Column>

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
.doctor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/chopper-bounty.png');
  background-size: contain;
  background-position: center center;
  font-size: medium;
}
.doctor-table {
  width: 150vh;
  margin: 1% 0 10% 0;
}
.add-doctor-form-children {
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