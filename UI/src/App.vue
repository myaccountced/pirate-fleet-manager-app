<script setup>
/**
 * Author: Cedric Losantas
 * Instructor: Ernesto Basoalto
 * Course: CWEB280
 * Date: December 11, 2024.
 * Final Project
 * File name: App.vue
 * http://localhost:5173/
 */

import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();
const isSignedIn = ref(false);
// List of items for the Menubar
const items = [
  {label: '⚔️ Fighters', url: '/fighters'},
  {label: '🩺 Doctors', url: '/doctors'},
  {label: '🛠️ Shipwrights', url: '/shipwrights'},
  {label: '💀 Graveyard', url: '/graveyard'},
];

onMounted(() => {
  const token = localStorage.getItem("token");

  if (token) {
    isSignedIn.value = true;
  }
})

// Sign-out the user
const handleSignOut = () => {
  localStorage.removeItem("token");  // Remove the token from the local storage
  isSignedIn.value = false;
  router.push('/');                       // Navigate to the login page
};
</script>

<template>
  <div id="page">
    <!-- Menu Bar -->
    <Menubar id="menubar" :model="items">
      <template #end>
        <Button label="Sign Out" severity="danger" @click="handleSignOut" style="margin-left: auto;" v-if="isSignedIn" />
      </template>
    </Menubar>

    <main>
      <RouterView/>
    </main>

    <!-- Footer for all the pages -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h5>About</h5>
          <p>
            Welcome aboard the Pirate Fleet Manager, where captains can chart the course for their crew and keep their
            ships in order. Our mission is to help you manage your pirate fleet and ensure smooth sailing on the high seas.
          </p>
          <p>
            As a captain, you can track the details of your crew members, each with their own unique set of skills.
            From fierce fighters wielding mighty weapons, to wise doctors offering remedies, and skilled shipwrights
            keeping your ships afloat, our system makes managing your fleet easy.
          </p>
          <p>
            Whether you're recruiting new crew members, sorting them by ship, or tracking their progress, this tool is
            your trusty first mate. You can also transfer crew between ships when needed and ensure no ship is left
            without a necessary role, even when tragedy strikes.
          </p>
        </div>
        <div class="footer-section">
          <h5>Contact Us</h5>
          <p>If you have any questions or feedback, feel free to reach out!</p>
          <a href="https://puginarug.com/" class="footer-btn">Get in Touch</a>
          <h5 class="mt-3">External Resources</h5>
          <p>Watch this pirate show please!</p>
          <a href="https://www.crunchyroll.com/series/GRMG8ZQZR/one-piece" class="footer-btn">Watch One Piece</a>
        </div>
        <div class="footer-section">
          <h5>Stay Connected</h5>
          <p>Follow us on our social media for the latest updates.</p>
          <div class="social-links">
            <a href="https://www.facebook.com" class="social-link">Facebook</a>
            <a href="https://www.twitter.com" class="social-link">Twitter</a>
            <a href="https://www.instagram.com" class="social-link">Instagram</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; Poem Library. All Rights Reserved.</span>
        <br>
        <a href="https://onesquareminesweeper.com/" class="footer-link">Privacy Policy</a> |
        <a href="https://cursoreffects.com/" class="footer-link">Terms of Service</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
main {
  margin: 1% 10% 0 10%;
  font-size: medium;
}

#menubar {
  margin: 0 10% 0 10%;
  background-image: url('./assets/beach.jpg');
  background-size: cover;
  background-position: center center;
  font-size: large;
}

#page {
  background-image: url('./assets/skull.jpg');
  background-size: cover;
  background-position: center center;
}

/* Footer Styling */
.footer {
  background-image: url('./assets/beach.jpg');
  background-size: cover;
  background-position: center center;
  padding: 40px 20px;
  margin: 1% 10% 0 10%;
  font-size: medium;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer-section {
  width: 30%;
  margin-bottom: 20px;
}

.footer-section h5 {
  font-size: x-large;
  margin-bottom: 10px;
}

.footer-section p {
  font-size: large;
  line-height: 1.5;
}

.footer-btn {
  display: inline-block;
  background-color: #118056;
  color: #fff;
  padding: 8px 15px;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 10px;
}

.footer-btn:hover {
  background-color: #0056b3;
}

.social-links {
  margin-top: 10px;
}

.social-link {
  margin-right: 15px;
  text-decoration: none;
  color: #118056;
}

.social-link:hover {
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  padding: 20px;
  background-color: #c9a086;
  margin-top: 20px;
}

.footer-link {
  text-decoration: none;
  color: #118056;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
