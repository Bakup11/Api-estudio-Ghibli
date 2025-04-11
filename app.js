window.addEventListener("DOMContentLoaded", () => {
  let currentTab = "films";
  let allData = {
    films: [],
    people: [],
    species: [],
    locations: [],
    vehicles: []
  };

  const searchInput = document.getElementById("search-input");
  const content = document.getElementById("content");
  const proxy = "https://api.allorigins.win/raw?url=";

  // Función de navegación
  window.navigateTo = function(section) {
    console.log("Navegando a:", section);
    
    // Ocultar todas las secciones
    document.getElementById("home-section").classList.add("hidden");
    document.getElementById("trivia-section").classList.add("hidden");
    document.getElementById("registration-section").classList.add("hidden");
    
    // Quitar clase activa de todos los elementos de navegación
    document.querySelectorAll(".bottom-nav-item").forEach(item => {
      item.classList.remove("active");
    });
    
    // Mostrar la sección seleccionada y activar el elemento de navegación
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
        // Iniciar o reanudar trivia
        if (typeof initTrivia === 'function') {
          initTrivia();
        }
        break;
      case "register":
        document.getElementById("registration-section").classList.remove("hidden");
        document.getElementById("nav-register").classList.add("active");
        break;
    }
  };

  window.loadData = async function(endpoint) {
    currentTab = endpoint;
    const url = `${proxy}https://ghibliapi.vercel.app/${endpoint}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Respuesta inválida");

      allData[endpoint] = data;
      renderList(data, endpoint);
      
      // Mostrar sección de contenido al cargar datos
      document.getElementById("home-section").classList.remove("hidden");
      document.getElementById("trivia-section").classList.add("hidden");
      document.getElementById("registration-section").classList.add("hidden");
    } catch (error) {
      console.error("Error al cargar datos:", error.message);
      content.innerHTML = `<p style="color: red;">Error al cargar los datos: ${error.message}</p>`;
    }
  };

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

  window.showFavorites = function() {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    content.innerHTML = "";

    document.getElementById("home-section").classList.remove("hidden");
    document.getElementById("trivia-section").classList.add("hidden");
    document.getElementById("registration-section").classList.add("hidden");

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

  const toggleBtn = document.getElementById("menu-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const navMenu = document.getElementById("nav-menu");
      if (navMenu) {
        navMenu.classList.toggle("hidden");
      }
    });
  }

  // Comenzar con la sección de inicio
  navigateTo("home");
});