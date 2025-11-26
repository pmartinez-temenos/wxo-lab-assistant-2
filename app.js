let authgearClient = null;
// Configura tus datos reales aquí:
const ENDPOINT = "https://mysec-labtory.authgear.cloud"; 
const CLIENT_ID = "c88b3a0b477c9f17";                     
const REDIRECT_URI = "https://pmartinez-temenos.github.io/wxo-lab-assistant-2/index.html"; 

// Inicializa Authgear en la web
const configureClient = async () => {
  if (!window.authgear || !window.authgear.default) {
    console.error("El SDK de Authgear no está disponible. Verifica la carga del script.");
    return;
  }
  authgearClient = window.authgear.default;
  try {
    await authgearClient.configure({
      endpoint: ENDPOINT,
      clientID: CLIENT_ID,
      sessionType: "refresh_token"
    });
    console.log("Authgear configurado.");
    document.getElementById("btn-login").disabled = false;
    document.getElementById("btn-logout").disabled = false;
  } catch (err) {
    console.error("Error configurando Authgear:", err);
  }
};

const login = async () => {
  if (!authgearClient) {
    console.error("Error: Authgear aún no está inicializado.");
    return;
  }
  try {
    await authgearClient.startAuthentication({
      redirectURI: REDIRECT_URI,
      prompt: "login",
    });
  } catch (err) {
    console.error("Login error:", err);
  }
};

// Logout de sesión
const logout = async () => {
  if (!authgearClient) {
    console.error("Error: Authgear aún no está inicializado.");
    return;
  }
  try {
    await authgearClient.logout({
      redirectURI: REDIRECT_URI,
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// Abrir ventana de configuración de usuario (preconstruida Authgear)
const openUserSettings = () => {
  authgearClient.open("/settings");
};

const mostrarUsuario = async () => {
  if (!authgearClient) {
    console.error("authgearClient no está inicializado.");
    return;
  }
  if (!authgearClient.sessionState) {
    console.error("sessionState no está disponible.");
    return;
  }  
  const isAuthenticated = authgearClient.sessionState === "AUTHENTICATED";
  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  document.getElementById("btn-settings").disabled = !isAuthenticated;
  document.getElementById("chatButton").disabled = !isAuthenticated;
  document.getElementById("chat-icon").disabled = !isAuthenticated;
  document.getElementById("wxo-chat").disabled = !isAuthenticated;
  if (isAuthenticated) {
    mostrarChatButton();
  } else {
    ocultarChatButton();
  }
  const usuario = document.getElementById("user-area");
  if (isAuthenticated) {
    const info = await authgearClient.fetchUserInfo();
    usuario.innerHTML = `<strong>Email:</strong> ${info.email} <br/><strong>Verified:</strong> ${info.email_verified}`;
  } else {
    usuario.innerHTML = `<em>No session started yet.</em>`;
  }
};

function ocultarChatButton() {
  // Selecciona todos los elementos con la clase del botón de chat
  const btns = document.getElementsByClassName('chatButton');
  for (let i = 0; i < btns.length; i++) {
    // Coloca el botón fuera de la vista (alternativamente puedes usar display: none)
    btns[i].style.position = "fixed";
    btns[i].style.display = "none";
    btns[i].style.left = "-9999px"; // Lo mueve fuera de la pantalla
  }
}

function mostrarChatButton() {
  const btns = document.getElementsByClassName('chatButton');
  for (let i = 0; i < btns.length; i++) {
    // Devuelve el botón a su posición original (ajusta según necesidades)
    btns[i].style.position = "";
    btns[i].style.display = "";
    btns[i].style.left = "";
  }
}

// Maneja flujo de autenticación y la redirección
window.onload = async () => {
  await configureClient();
  const query = window.location.search;
  if (query.includes("code=")) {
    await authgearClient.finishAuthentication();
    window.history.replaceState({}, document.title, REDIRECT_URI); // limpieza de URL
  }
  mostrarUsuario();
  // Lanza una llamada adicional unos segundos después para scripts externos
  setTimeout(() => { mostrarUsuario(); }, 3000);
};
