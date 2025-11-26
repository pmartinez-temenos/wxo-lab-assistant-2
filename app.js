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

function aplicarEstilosWXO_JS() {
  const elems = document.querySelectorAll('.wxo-float-container, .wxo-float');
  elems.forEach(elem => {
    elem.style.width = "80vw";
    elem.style.height = "85vh";
    elem.style.maxWidth = "80vw";
    elem.style.maxHeight = "85vh";
    elem.style.left = "10vw";
    elem.style.top = "12vh";
    elem.style.right = "auto";
    elem.style.bottom = "auto";
    elem.style.position = "fixed";
    elem.style.zIndex = "99999";
  });
}

function cargarChatSiAutorizado() {
  // Solo carga el script si no está ya presente
  if (!document.getElementById("wxochat-script")) {
    window.wxOConfiguration = {
      orchestrationID: "4293d2231821498eae786b8655444d73_784c9f72-6d76-4c4a-a76a-079520e08474",
      hostURL: "https://au-syd.watson-orchestrate.cloud.ibm.com",
      rootElementID: "root",
      deploymentPlatform: "ibmcloud",
      crn: "crn:v1:bluemix:public:watsonx-orchestrate:au-syd:a/4293d2231821498eae786b8655444d73:784c9f72-6d76-4c4a-a76a-079520e08474::",
      chatOptions: {
        agentId: "12766403-d467-4e68-8f8b-f45708c04b0f", 
        agentEnvironmentId: "ae07cbd4-9729-4a5b-b466-b97eb2f0237a",
      }
    };
    const script = document.createElement('script');
    script.src = `${window.wxOConfiguration.hostURL}/wxochat/wxoLoader.js?embed=true`;
    script.id = "wxochat-script"; // Identificador para evitar duplicados
    script.addEventListener('load', function () {
      if (window.wxoLoader) {
        wxoLoader.init();
        aplicarEstilosWXO_JS();
      }
    });
    document.head.appendChild(script);
    aplicarEstilosWXO_JS();
  }
}

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
  if (isAuthenticated) {
    cargarChatSiAutorizado();
  } else {
    const s = document.getElementById("wxochat-script");
    if (s) s.remove();
  }
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
  // Lanza una llamada adicional unos segundos después para scripts externos
  setTimeout(() => { mostrarUsuario(); }, 5000);
};
