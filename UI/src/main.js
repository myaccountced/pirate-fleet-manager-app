/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: main.js
 */

import { createApp } from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import App from './App.vue'
import LoginView from "./components/LoginView.vue";
import GraveyardView from "./components/GraveyardView.vue";
import FighterView from "./components/FighterView.vue";
import DoctorView from "./components/DoctorView.vue";
import ShipwrightView from "./components/ShipwrightView.vue";
import ShipComponent from "./components/ShipComponent.vue";
// Primevue setup
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import {Form, FormField} from '@primevue/forms';
import {FloatLabel, InputText, Button, ToastService, Toast, InputGroup, InputGroupAddon, Select,
            InputNumber, DataTable, Column, ColumnGroup, Row, Tag, Message, IconField, InputIcon,
            Dialog, DatePicker, Card, Menubar} from "primevue";

// Setup routes
const routes = [
    {path: '/', component: LoginView},
    {path: '/fighters', component: FighterView},
    {path: '/doctors', component: DoctorView},
    {path: '/shipwrights', component: ShipwrightView},
    {path: '/graveyard', component: GraveyardView},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App);
app.use(router)

// Initialize PrimeVue and PrimeVue components
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ToastService);
app.component('Button', Button);
app.component('FloatLabel', FloatLabel);
app.component('InputText', InputText);
app.component('Form', Form);
app.component('FormField', FormField);
app.component('Toast', Toast);
app.component('InputGroup', InputGroup);
app.component('InputGroupAddon', InputGroupAddon);
app.component('Select', Select);
app.component('InputNumber', InputNumber);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.component('Tag', Tag);
app.component('Message', Message);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Dialog', Dialog);
app.component('DatePicker', DatePicker);
app.component('Card', Card);
app.component('ShipComponent', ShipComponent);
app.component('Menubar', Menubar);

app.mount('#app');