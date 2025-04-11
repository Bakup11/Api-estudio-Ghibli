// Firebase Authentication
document.addEventListener("DOMContentLoaded", function() {
  // Firebase configuration will be added here
  const firebaseConfig = {
    apiKey: "AIzaSyA0fSMNW58egxN3rF5EBIW7Jl7U7BkZvwk",
    authDomain: "fir-ghibli.firebaseapp.com",
    projectId: "fir-ghibli",
    storageBucket: "fir-ghibli.firebasestorage.app",
    messagingSenderId: "1096959595174",
    appId: "1:1096959595174:web:eacd98bd30a7eff1e89a67"
  };
  // 
  // // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const registrationForm = document.getElementById("registration-form");
  const loginForm = document.getElementById("login-form");
  const authMessage = document.getElementById("auth-message");

  // Registration handler
  if (registrationForm) {
    registrationForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      // Uncomment when Firebase is configured
      firebase.auth().createUserWithEmailAndPassword(email, password)