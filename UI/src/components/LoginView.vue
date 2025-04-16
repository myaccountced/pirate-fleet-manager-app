<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: LoginView.vue
 * http://localhost:5173/
 */

import {onMounted, ref} from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref('');     // Entered username
const password = ref('');     // Entered password
const errorMessage = ref(''); // Generated error message

onMounted(() => {
  const token = localStorage.getItem("token");

  // If we already have a token, navigate to the Fighter page because we don't need to sign-in
  if (token) {
    router.push('/fighters');
  }
})

// Handle the login functionality. Sends credentials to the backend and the backend returns a token.
const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3004/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer iHaveReadAccessLevel',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const text = await response.text(); // Get the raw response text

    if (response.ok) {
      const data = JSON.parse(text);

      if (data.token) {
        localStorage.setItem(`token`, data.token);  // Store the token into the local storage
        window.location.href = '/fighters';         // Navigate to the Fighters page
      }
    }
    else {
      // Handle errors if there's an issue with the login
      const errorData = JSON.parse(text);
      if (errorData.message) {
        errorMessage.value = errorData.message || 'Sign in failed';
      }
      console.error('Sign in failed:', errorData.error);
    }
  } catch (error) {
    // Catch any network errors or unexpected issues
    errorMessage.value = 'Error during sign-in. Please try again later.';
    console.error('Error during sign-in:', error);
  }
}
</script>

<template>
  <div class="login">
    <div class="container">
      <form @submit.prevent="handleLogin">
        <h1>Sign-in to your account</h1>

        <FloatLabel>
          <InputText id="username" type="text" v-model="username" required />
          <label for="Username">Username</label>
        </FloatLabel>

        <FloatLabel>
          <InputText id="password" type="password" v-model="password" required />
          <label for="Password">Password</label>
        </FloatLabel>

        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

        <Button label="Sign In" type="submit"></Button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
  background-image: url('../assets/ussop-bounty.png');
  background-size: contain;
  background-position: center center;
}

.container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  max-width: 500px; /* Control the horizontal placement */
}

h1 {
  margin-bottom: 25px;
  color: #333;
}

form {
  background: white;
  padding: 40px 45px 40px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

#username, #password {
  width: 100%;
  padding: 3%;
  margin: 25px 0 20px 0;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #3aadc4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

button:hover {
  background-color: #218838; /* Darker green on hover */
}

@media (max-width: 400px) {
  input {
    font-size: 14px;
  }
}
</style>