<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: ShipComponent.vue
 */

const props = defineProps({id: Number, name: String, img: String, isSelected: Boolean});
const emit = defineEmits(['shipInfo']);

const sendToParent = () => {
  emit('shipInfo',{id: props.id, name: props.name});
};
</script>

<template>
  <!-- This generates a ship card, which will become one of the ship options in the transfer ship dialog box -->
  <Card id="card" :class="{ selected: isSelected }" @click="sendToParent">
    <template #title>{{ name }}</template>
    <template #content><img :src="img" alt="Image of a ship" /></template>
  </Card>
</template>

<style scoped>
#card {
  width: 200px;
  margin: 5px;
  text-align: center;
  transition: background-color 0.3s ease;
}

#card.selected {
  background-color: #096593;
}

img {
  display: block;
  width: 100%;
  height: 110px;
  margin: auto;
}
</style>


