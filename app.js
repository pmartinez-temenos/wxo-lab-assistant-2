let authgearClient = null;
// Configura tus datos reales aquí:
const ENDPOINT = "https://mysec-labtory.authgear.cloud"; 
const CLIENT_ID = "c88b3a0b477c9f17";                     
const REDIRECT_URI = "https://pmartinez-temenos.github.io/wxo-lab-assistant-2/"; 

// Inicializa Authgear en la web
const configureClient = async () => {
  authgearClient = window.authgear.default;
  await authgearClient.configure({
    endpoint: ENDPOINT,
    clientID: CLIENT_ID,
    sessionType: "refresh_token",
  }).then(
    () => console.log("Authgear configurado."),
    (err) => console.log("Error configurando Authgear:", err)
  );
};

// Iniciar login con redirección
const login = async () => {
  await authgearClient.startAuthentication({
    redirectURI: REDIRECT_URI, // GitHub Pages URI pública (ajústala)
    prompt: "login",
  }).catch(err => console.log("Login error:", err));
};

// Logout de sesión
const logout = async () => {
  await authgearClient.logout({
    redirectURI: REDIRECT_URI, // Idealmente tu página principal
  }).catch(err => console.log("Logout error:", err));
};

// Abrir ventana de configuración de usuario (preconstruida Authgear)
const openUserSettings = () => {
  authgearClient.open("/settings");
};

const mostrarUsuario = async () => {
  const isAuthenticated = authgearClient.sessionState === "AUTHENTICATED";
  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  document.getElementById("btn-settings").disabled = !isAuthenticated;
  const usuario = document.getElementById("user-area");
  if (isAuthenticated) {
    const info = await authgearClient.fetchUserInfo();
    usuario.innerHTML = `<strong>Email:</strong> ${info.email} <br/><strong>Verified:</strong> ${info.email_verified}`;
  } else {
    usuario.innerHTML = `<em>No session started yet.</em>`;
  }
};

// Maneja flujo de autenticación y la redirección
window.onload = async () => {
  await configureClient();
  const query = window.location.search;
  if (query.includes("code=")) {
    await authgearClient.finishAuthentication();
    window.history.replaceState({}, document.title, REDIRECT_URI); // limpieza de URL
  }
  mostrarUsuario();
};
