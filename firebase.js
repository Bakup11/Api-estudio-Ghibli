// Configura Firebase con tus credenciales
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const email = form[1].value;
    const password = form[2].value;
  
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
  
        // Guardar información adicional en Firestore
        return db.collection("usuarios").doc(user.uid).set({
          nombre: form[0].value,
          usuario: form[3].value,
          ciudad: form[4].value,
          telefono: form[5].value,
          nacimiento: form[6].value,
          email: email
        });
      })
      .then(() => {
        alert("¡Registro exitoso!");
        form.reset();
      })
      .catch(error => {
        console.error(error);
        alert("Error en el registro: " + error.message);
      });
  }
  