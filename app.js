// Espera a que el DOM esté completamente cargado antes de ejecutar el script
window.addEventListener("DOMContentLoaded", () => {
  // Configurar el almacenamiento mejorado
  setupStorage();

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

  // Prueba inicial de llamada a la API (sólo para consola) para evitar errores de CORS
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
        loadInfoSection();
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

  // Función para cargar la sección de información
  function loadInfoSection() {
    const infoSection = document.getElementById("info-section");
    
    // Crear la estructura del contenido
    const infoHTML = `
      <div class="info-container">
        <h2>Información</h2>
        <div class="info-content">
          <div class="api-info">
            <h3>Studio Ghibli API</h3>
            <div class="info-logo">
              <img src="IMG/studio-ghibli-seeklogo.png" alt="Logo Studio Ghibli" class="ghibli-logo">
            </div>
            <div class="info-description">
              <p>Esta aplicación utiliza la API de Studio Ghibli, que proporciona acceso a información sobre las películas, personajes, especies, lugares y vehículos del famoso estudio de animación japonés.</p>
            </div>
          </div>
          
          <div class="student-info">
            <h3>Información del Desarrollador</h3>
            <p><strong>Nombre del Estudiante:</strong> Wilson Andres Carmona Barco</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/Bakup11">@Bakup11</a></p>
            <p><strong>Versión:</strong> V.1.0.0</p>
          </div>
        </div>
      </div>
    `;
    
    // Asignar el HTML al contenedor
    infoSection.innerHTML = infoHTML;
  }

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

  // Muestra los favoritos guardados
  window.showFavorites = function() {
    try {
      const favoritosString = window.appStorage.getItem("favoritos") || "[]";
      const favoritos = JSON.parse(favoritosString);
      
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
    } catch (error) {
      console.error("Error al mostrar favoritos:", error);
      content.innerHTML = "<p>Error al cargar favoritos.</p>";
    }
  };

  // Maneja clicks en los botones de favoritos dentro del contenedor
  content.addEventListener("click", (e) => {
    if (e.target.classList.contains("favorite-btn")) {
      const id = e.target.dataset.id;
      const type = e.target.dataset.type;
      const item = allData[type].find(i => i.id === id);
      
      try {
        // Obtener favoritos existentes usando nuestro método personalizado
        const favoritosString = window.appStorage.getItem("favoritos") || "[]";
        const favoritos = JSON.parse(favoritosString);
        
        if (!favoritos.some(fav => fav.id === id)) {
          favoritos.push({ ...item, type });
          // Guardar usando nuestro método personalizado
          window.appStorage.setItem("favoritos", JSON.stringify(favoritos));
          alert("Agregado a favoritos");
        }
      } catch (error) {
        console.error("Error al procesar favorito:", error);
        alert("No se pudo agregar a favoritos");
      }
    }

    if (e.target.classList.contains("remove-favorite-btn")) {
      const id = e.target.dataset.id;
      try {
        // Obtener favoritos existentes
        const favoritosString = window.appStorage.getItem("favoritos") || "[]";
        let favoritos = JSON.parse(favoritosString);
        
        // Filtrar el favorito a eliminar
        favoritos = favoritos.filter(fav => fav.id !== id);
        
        // Guardar la nueva lista
        window.appStorage.setItem("favoritos", JSON.stringify(favoritos));
        
        // Actualizar la vista
        showFavorites();
      } catch (error) {
        console.error("Error al eliminar favorito:", error);
      }
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
  // Registra el Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/Api-estudio-Ghibli/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado con éxito:', registration.scope);
        })
        .catch((error) => {
          console.error('Fallo el registro del Service Worker:', error);
        });
    });
  }
});

// Sistema de almacenamiento mejorado para compatibilidad WebView
function setupStorage() {
  // Verificar si estamos en Android WebView
  const isAndroidWebView = /wv/.test(navigator.userAgent) || 
                          /Android/.test(navigator.userAgent);
  
  // Objeto para almacenamiento en memoria cuando todo falla
  const memoryStorage = {};
  
  window.appStorage = {
    setItem: function(key, value) {
      try {
        // Intentar usar localStorage
        localStorage.setItem(key, value);
        // También intentar guardar en sessionStorage como respaldo
        sessionStorage.setItem(key, value);
        // También guardar en memoria
        memoryStorage[key] = value;
        return true;
      } catch (e) {
        console.error("Error al guardar datos:", e);
        // Si falla, al menos guardamos en memoria
        memoryStorage[key] = value;
        return true;
      }
    },
    
    getItem: function(key) {
      try {
        // Intentar desde localStorage primero
        let data = localStorage.getItem(key);
        // Si no existe, intentar desde sessionStorage
        if (!data) {
          data = sessionStorage.getItem(key);
        }
        // Si aún no existe, intentar desde memoria
        if (!data && memoryStorage[key]) {
          data = memoryStorage[key];
        }
        return data;
      } catch (e) {
        console.error("Error al recuperar datos:", e);
        // Si falla, intentar desde memoria
        return memoryStorage[key] || null;
      }
    },
    
    removeItem: function(key) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        delete memoryStorage[key];
        return true;
      } catch (e) {
        console.error("Error al eliminar datos:", e);
        // Al menos eliminamos de memoria
        delete memoryStorage[key];
        return true;
      }
    }
  };
  
  // Si estamos en Android WebView, intentar mejorar la persistencia
  if (isAndroidWebView) {
    console.log("Detectado Android WebView - Configurando almacenamiento mejorado");
    
    // Cargar desde localStorage al iniciar
    try {
      const savedFavorites = localStorage.getItem("favoritos");
      if (savedFavorites) {
        memoryStorage["favoritos"] = savedFavorites;
      }
    } catch (e) {
      console.error("Error al inicializar almacenamiento:", e);
    }
    
    // Intentar guardar periódicamente
    setInterval(function() {
      try {
        if (memoryStorage["favoritos"]) {
          localStorage.setItem("favoritos", memoryStorage["favoritos"]);
          console.log("Guardado periódico completado");
        }
      } catch (e) {
        console.error("Error en guardado periódico:", e);
      }
    }, 30000); // Cada 30 segundos
    
    // Intentar guardar cuando la aplicación se pone en segundo plano
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "hidden") {
        try {
          if (memoryStorage["favoritos"]) {
            localStorage.setItem("favoritos", memoryStorage["favoritos"]);
            console.log("Guardado en segundo plano");
          }
        } catch (e) {
          console.error("Error al guardar en segundo plano:", e);
        }
      }
    });
  }
}