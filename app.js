// Espera a que el DOM esté completamente cargado antes de ejecutar el script
window.addEventListener("DOMContentLoaded", () => {

  // Sección activa por defecto
  let currentTab = "films";

  // Objeto para almacenar los datos cargados desde la API, por tipo
  let allData = {
    films: [],
    people: [],
    species: [],
    locations: [],
    vehicles: []
  };

  // Elementos del DOM para búsqueda y contenido
  const searchInput = document.getElementById("search-input");
  const content = document.getElementById("content");

  // Proxy para evitar errores CORS
  const proxy = "https://api.allorigins.win/raw?url=";

  // Prueba inicial de llamada a la API (sólo para consola)
  fetch('https://api.codetabs.com/v1/proxy?quest=https://ghibliapi.vercel.app/films')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error al cargar datos:', error));

  // Función para navegar entre secciones
  window.navigateTo = function(section) {
    console.log("Navegando a:", section);

    // Oculta todas las secciones
    document.getElementById("home-section").classList.add("hidden");
    document.getElementById("trivia-section").classList.add("hidden");
    document.getElementById("registration-section").classList.add("hidden");
    document.getElementById("info-section").classList.add("hidden");

    // Quita la clase 'active' de todos los botones del menú
    document.querySelectorAll(".bottom-nav-item").forEach(item => {
      item.classList.remove("active");
    });

    // Muestra la sección correspondiente y activa el botón del menú
    switch(section) {
      case "home":
        document.getElementById("home-section").classList.remove("hidden");
        document.getElementById("nav-home").classList.add("active");
        if (allData.films.length === 0) {
          loadData("films");
        }
        break;
      case "films":
        document.getElementById("home-section").classList.remove("hidden");
        document.getElementById("nav-films").classList.add("active");
        loadData("films");
        break;
      case "trivia":
        document.getElementById("trivia-section").classList.remove("hidden");
        document.getElementById("nav-trivia").classList.add("active");
        if (typeof initTrivia === 'function') {
          initTrivia(); // Llama a la trivia si está definida
        }
        break;
      case "register":
        document.getElementById("registration-section").classList.remove("hidden");
        document.getElementById("nav-register").classList.add("active");
        break;
      case "info":
        document.getElementById("info-section").classList.remove("hidden");
        document.getElementById("nav-info").classList.add("active");
        break;
    }
  };

  // Carga los datos de una categoría específica desde la API
  window.loadData = async function(endpoint) {
    currentTab = endpoint;
    const url = `${proxy}https://ghibliapi.vercel.app/${endpoint}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Respuesta inválida");

      allData[endpoint] = data; // Guarda los datos en memoria
      renderList(data, endpoint); // Muestra los datos

      // Asegura que solo la sección principal está visible
      document.getElementById("home-section").classList.remove("hidden");
      document.getElementById("trivia-section").classList.add("hidden");
      document.getElementById("registration-section").classList.add("hidden");
      document.getElementById("info-section").classList.add("hidden");
    } catch (error) {
      console.error("Error al cargar datos:", error.message);
      content.innerHTML = `<p style="color: red;">Error al cargar los datos: ${error.message}</p>`;
    }
  };

  // Devuelve la imagen correspondiente a cada tipo de entidad
  function getImage(type, item) {
    switch (type) {
      case "films":
        return item.image;
      case "people":
        return "https://static.wikia.nocookie.net/studio-ghibli/images/8/89/Ponyo.png";
      case "species":
        return "https://static.wikia.nocookie.net/studio-ghibli/images/f/f9/Race_default.png";
      case "locations":
        return "https://static.wikia.nocookie.net/studio-ghibli/images/6/6d/Location_default.png";
      case "vehicles":
        return "https://static.wikia.nocookie.net/studio-ghibli/images/8/8e/Vehicle_default.png";
      default:
        return "https://via.placeholder.com/150";
    }
  }

  // Renderiza una lista de ítems como tarjetas HTML
  function renderList(data, type) {
    content.innerHTML = "";

    data.filter(Boolean).forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <strong>${item.title || item.name}</strong><br>
        <img src="${getImage(type, item)}" alt="${item.title || item.name}" class="ghibli-image" />
        <p>${item.description || item.gender || item.eye_color || item.classification || item.terrain || item.vehicle_class || "Sin descripción disponible."}</p>
        <button class="favorite-btn" data-id="${item.id}" data-type="${type}">⭐ Favorito</button>
      `;
      content.appendChild(div);
    });
  }

  // Muestra los favoritos guardados en localStorage
  window.showFavorites = function() {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    content.innerHTML = "";

    document.getElementById("home-section").classList.remove("hidden");
    document.getElementById("trivia-section").classList.add("hidden");
    document.getElementById("registration-section").classList.add("hidden");
    document.getElementById("info-section").classList.add("hidden");

    if (favoritos.length === 0) {
      content.innerHTML = "<p>No tienes favoritos aún.</p>";
      return;
    }

    favoritos.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <strong>${item.title || item.name}</strong><br>
        <img src="${getImage(item.type, item)}" alt="${item.title || item.name}" class="ghibli-image" />
        <p>${item.description || item.gender || item.eye_color || item.classification || item.terrain || item.vehicle_class || "Sin descripción disponible."}</p>
        <button class="remove-favorite-btn" data-id="${item.id}" data-type="${item.type}">❌ Quitar</button>
      `;
      content.appendChild(div);
    });
  };

  // Maneja clicks en los botones de favoritos dentro del contenedor
  content.addEventListener("click", (e) => {
    if (e.target.classList.contains("favorite-btn")) {
      const id = e.target.dataset.id;
      const type = e.target.dataset.type;
      const item = allData[type].find(i => i.id === id);
      const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

      if (!favoritos.some(fav => fav.id === id)) {
        favoritos.push({ ...item, type });
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        alert("Agregado a favoritos");
      }
    }

    if (e.target.classList.contains("remove-favorite-btn")) {
      const id = e.target.dataset.id;
      let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
      favoritos = favoritos.filter(fav => fav.id !== id);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      showFavorites();
    }
  });

  // Búsqueda en vivo dentro de la categoría actual
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      const data = allData[currentTab];
      const filtered = data.filter(item => {
        return (item.title || item.name).toLowerCase().includes(term);
      });
      renderList(filtered, currentTab);
    });
  }

  // Mostrar u ocultar el menú de navegación en móviles
  const toggleBtn = document.getElementById("menu-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const navMenu = document.getElementById("nav-menu");
      if (navMenu) {
        navMenu.classList.toggle("hidden");
      }
    });
  }

  // Carga la sección inicial al entrar
  navigateTo("home");
});