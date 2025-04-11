// Base de datos de trivia con preguntas sobre películas de Studio Ghibli
const triviaQuestions = [
    {
      question: "¿Quién fundó Studio Ghibli?",
      options: ["Hayao Miyazaki e Isao Takahata", "Toshio Suzuki y Mamoru Hosoda", "Makoto Shinkai y Satoshi Kon", "Yoshifumi Kondō y Joe Hisaishi"],
      answer: 0
    },
    {
      question: "¿En qué año se fundó Studio Ghibli?",
      options: ["1982", "1985", "1988", "1991"],
      answer: 1
    },
    {
      question: "¿Qué película de Studio Ghibli ganó un Oscar?",
      options: ["Mi vecino Totoro", "La princesa Mononoke", "El viaje de Chihiro", "El castillo ambulante"],
      answer: 2
    },
    {
      question: "¿Qué significa la palabra 'Ghibli'?",
      options: ["Viento cálido del desierto", "Espíritu del bosque", "Luz de luna", "Protector de la naturaleza"],
      answer: 0
    },
    {
      question: "¿Cuál fue la primera película oficial de Studio Ghibli?",
      options: ["Nausicaä del Valle del Viento", "El castillo en el cielo", "Mi vecino Totoro", "La tumba de las luciérnagas"],
      answer: 1
    },
    {
      question: "¿En qué película aparece el personaje Totoro?",
      options: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "Ponyo en el acantilado"],
      answer: 1
    },
    {
      question: "¿Qué película cuenta la historia de una joven bruja que decide independizarse?",
      options: ["El servicio de entrega de Kiki", "El reino de los gatos", "Ponyo en el acantilado", "Arrietty y el mundo de los diminutos"],
      answer: 0
    },
    {
      question: "¿Quién compone regularmente la música para las películas de Studio Ghibli?",
      options: ["Ryuichi Sakamoto", "Joe Hisaishi", "Yoko Kanno", "Yuki Kajiura"],
      answer: 1
    },
    {
      question: "¿Qué película narra la historia de una princesa que lucha por proteger el bosque?",
      options: ["El viaje de Chihiro", "El castillo ambulante", "La princesa Mononoke", "Nausicaä del Valle del Viento"],
      answer: 2
    },
    {
      question: "¿Cuál es el nombre de la mascota del estudio que aparece en su logo?",
      options: ["Totoro", "Jiji", "Calcifer", "Chu-Totoro"],
      answer: 0
    },
    {
      question: "En 'El viaje de Chihiro', ¿en qué se transforman los padres de Chihiro?",
      options: ["Ranas", "Cerdos", "Pájaros", "Peces"],
      answer: 1
    },
    {
      question: "¿Cuál de estas películas NO fue dirigida por Hayao Miyazaki?",
      options: ["Ponyo en el acantilado", "La tumba de las luciérnagas", "El castillo ambulante", "El viento se levanta"],
      answer: 1
    },
    {
      question: "¿Qué personaje se convierte en un espíritu de río en 'El viaje de Chihiro'?",
      options: ["No-Face", "Zeniba", "Haku", "Kamaji"],
      answer: 2
    },
    {
      question: "¿Qué película está basada en un cuento occidental?",
      options: ["El castillo ambulante", "Arrietty y el mundo de los diminutos", "Cuentos de Terramar", "Todas las anteriores"],
      answer: 3
    },
    {
      question: "¿En qué película un grupo de tanukis intenta proteger su bosque de la urbanización?",
      options: ["Pompoko", "La princesa Mononoke", "Panda! Go Panda!", "El cuento de la princesa Kaguya"],
      answer: 0
    }
  ];
  
  // Variables para la funcionalidad de trivia
  let currentQuestionIndex = 0;
  let score = 0;
  let questionAnswered = false;
  
  // Inicializar trivia
  window.initTrivia = function() {
    console.log("Inicializando trivia");
    // Obtener elementos del DOM
    const triviaQuestion = document.getElementById("trivia-question");
    const triviaOptions = document.getElementById("trivia-options");
    const triviaResult = document.getElementById("trivia-result");
    const nextQuestionBtn = document.getElementById("next-question");
    const triviaScore = document.getElementById("trivia-score");
  
    // Reiniciar si estamos empezando de nuevo
    if (currentQuestionIndex >= triviaQuestions.length) {
      currentQuestionIndex = 0;
      score = 0;
    }
    
    // Mostrar primera pregunta si aún no hemos comenzado
    displayQuestion(currentQuestionIndex);
    
    // Actualizar puntuación
    updateScore();
    
    // Configurar el botón de siguiente pregunta
    nextQuestionBtn.addEventListener("click", () => {
      currentQuestionIndex++;
      
      if (currentQuestionIndex < triviaQuestions.length) {
        displayQuestion(currentQuestionIndex);
      } else {
        // Reiniciar para un nuevo juego
        currentQuestionIndex = 0;
        score = 0;
        displayQuestion(currentQuestionIndex);
        nextQuestionBtn.textContent = "Siguiente Pregunta";
      }
    });
  
    // Funciones internas
    function displayQuestion(index) {
      const question = triviaQuestions[index];
      questionAnswered = false;
      
      // Mostrar pregunta
      triviaQuestion.innerHTML = `<div class="trivia-question">${question.question}</div>`;
      
      // Mostrar opciones
      triviaOptions.innerHTML = "";
      question.options.forEach((option, i) => {
        const button = document.createElement("button");
        button.className = "trivia-option";
        button.textContent = option;
        button.dataset.index = i;
        button.addEventListener("click", () => checkAnswer(i));
        triviaOptions.appendChild(button);
      });
      
      // Resetear área de resultado y ocultar botón siguiente
      triviaResult.innerHTML = "";
      triviaResult.style.backgroundColor = "";
      nextQuestionBtn.classList.add("hidden");
    }
  
    function checkAnswer(selectedIndex) {
      if (questionAnswered) return;
      
      const currentQuestion = triviaQuestions[currentQuestionIndex];
      const correctIndex = currentQuestion.answer;
      
      // Marcar respuesta como verificada para prevenir selecciones múltiples
      questionAnswered = true;
      
      // Marcar opciones como correctas/incorrectas
      const options = triviaOptions.querySelectorAll(".trivia-option");
      options.forEach((option, i) => {
        option.disabled = true;
        if (i === correctIndex) {
          option.classList.add("correct");
        } else if (i === selectedIndex) {
          option.classList.add("incorrect");
        }
      });
      
      // Actualizar puntuación y mostrar resultado
      if (selectedIndex === correctIndex) {
        score++;
        triviaResult.innerHTML = "¡Correcto! 🎉";
        triviaResult.style.backgroundColor = "#d4edda";
        updateScore();
      } else {
        triviaResult.innerHTML = `Incorrecto. La respuesta correcta es: ${currentQuestion.options[correctIndex]}`;
        triviaResult.style.backgroundColor = "#f8d7da";
      }
      
      // Mostrar botón de siguiente pregunta o puntuación final
      if (currentQuestionIndex < triviaQuestions.length - 1) {
        nextQuestionBtn.classList.remove("hidden");
      } else {
        triviaResult.innerHTML += `<p>¡Has completado la trivia! Puntuación final: ${score}/${triviaQuestions.length}</p>
                                 <p>Presiona el botón para comenzar de nuevo.</p>`;
        nextQuestionBtn.textContent = "Reiniciar Trivia";
        nextQuestionBtn.classList.remove("hidden");
      }
    }
  
    function updateScore() {
      triviaScore.textContent = `Puntuación: ${score}/${triviaQuestions.length}`;
    }
  };
  
  // Verificar si la página acaba de cargarse y se está en la sección de trivia
  document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'trivia') {
      navigateTo('trivia');
    }
  });