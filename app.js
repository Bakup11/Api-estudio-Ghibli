const BASE_URL = "https://api.allorigins.win/raw?url=https://ghibliapi.vercel.app";

const endpoints = {
  films: "/films",
  characters: "/people",
  species: "/species",
  locations: "/locations",
  vehicles: "/vehicles"
};

const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");

let currentTab = "films";
let allData = {};

async function fetchData(type) {
  const res = await fetch(BASE_URL + endpoints[type]);
  const data = await res.json();
  allData[type] = data;
  renderList(data, type);
}

function renderList(data, type) {
  content.innerHTML = "";
  const filtered = data.filter(item =>
    item.name?.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    const title = item.title || item.name;
    const description = item.description || item.gender || item.classification || item.terrain || item.vehicle_class || "Sin descripción";
    const image = getImage(type, item);

    div.innerHTML = `
      <strong>${title}</strong><br>
      <img src="${image}" alt="${title}" class="ghibli-image" /><br>
      <p>${description}</p>
      <button onclick="toggleFavorite('${type}', '${item.id}')">⭐ Favorito</button>
    `;
    content.appendChild(div);
  });
}

function getImage(type, item) {
  if (type === "films" && item.image) {
    return item.image;
  }

  const fallbackImages = {
    characters: "https://cdn-icons-png.flaticon.com/512/706/706830.png",
    species: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    locations: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    vehicles: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
    default: "https://cdn-icons-png.flaticon.com/512/565/565547.png"
  };

  return fallbackImages[type] || fallbackImages.default;
}

function showTab(tab) {
  currentTab = tab;
  content.innerHTML = "";
  searchInput.style.display = tab === "register" || tab === "trivia" || tab === "home" ? "none" : "block";

  if (tab === "register") return renderRegisterForm();
  if (tab === "trivia") return renderTrivia();
  if (tab === "home") return content.innerHTML = "<h2>Bienvenido al mundo de Studio Ghibli 🌿</h2>";
  if (tab === "favorites") return renderFavorites();

  if (allData[tab]) {
    renderList(allData[tab], tab);
  } else {
    fetchData(tab);
  }
}

function renderRegisterForm() {
  content.innerHTML = `
    <form onsubmit="handleRegister(event)">
      <input type="text" placeholder="Nombre" required><br>
      <input type="email" placeholder="Email" required><br>
      <input type="password" placeholder="Contraseña" required><br>
      <input type="text" placeholder="Usuario" required><br>
      <input type="text" placeholder="Ciudad" required><br>
      <input type="tel" placeholder="Teléfono" required><br>
      <input type="date" required><br>
      <button type="submit">Registrarse</button>
    </form>
  `;
}

function handleRegister(event) {
  event.preventDefault();
  alert("Registro enviado (a integrar con Firebase)");
}

function renderTrivia() {
  content.innerHTML = `
    <h2>Trivia Ghibli</h2>
    <p>¿Cómo se llama el espíritu del bosque en "Mi vecino Totoro"?</p>
    <button onclick="alert('¡Correcto!')">Totoro</button>
    <button onclick="alert('Incorrecto 😅')">Ponyo</button>
  `;
}

function toggleFavorite(type, id) {
  let favs = JSON.parse(localStorage.getItem("ghibliFavs")) || {};
  favs[type] = favs[type] || [];
  if (favs[type].includes(id)) {
    favs[type] = favs[type].filter(f => f !== id);
  } else {
    favs[type].push(id);
  }
  localStorage.setItem("ghibliFavs", JSON.stringify(favs));
  alert("Actualizado en favoritos");
}

function renderFavorites() {
  content.innerHTML = "<h2>Favoritos</h2>";
  const favs = JSON.parse(localStorage.getItem("ghibliFavs")) || {};
  Object.keys(favs).forEach(type => {
    favs[type].forEach(id => {
      const item = allData[type]?.find(el => el.id === id);
      if (item) {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <strong>${item.title || item.name}</strong><br>
          <img src="${getImage(type, item)}" alt="${item.title || item.name}" class="ghibli-image" />
        `;
        content.appendChild(div);
      }
    });
  });
}

searchInput.addEventListener("input", () => {
  if (allData[currentTab]) renderList(allData[currentTab], currentTab);
});

showTab("home");

// Menú hamburguesa
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("nav-menu").classList.toggle("hidden");
});

// Mostrar favoritos con opción de eliminar
function showFavorites() {
  const content = document.getElementById("content");
  content.innerHTML = "<h2>Favoritos</h2>";
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    content.innerHTML += "<p>No hay elementos favoritos.</p>";
    return;
  }

  const container = document.createElement("div");
  container.id = "favorites-container";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  container.style.gap = "20px";
  container.style.padding = "20px";

  favorites.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.title || item.name}</h3>
      ${item.image ? `<img src="${item.image}" alt="${item.title || item.name}" class="ghibli-image">` : ""}
      <button class="remove-fav" data-id="${item.id}">❌ Quitar</button>
    `;
    container.appendChild(card);
  });

  content.appendChild(container);

  document.querySelectorAll(".remove-fav").forEach(button => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      let updatedFavorites = favorites.filter(fav => fav.id !== id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showFavorites();
    });
  });
}
const menuToggle = document.getElementById("menu-toggle");

if (menuToggle) {
  menuToggle.addEventListener("click", function () {
    document.getElementById("nav-menu").classList.toggle("hidden");
  });
} else {
  console.warn("Botón de menú hamburguesa no encontrado en el DOM");
}
