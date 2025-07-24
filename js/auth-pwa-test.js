import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();

let redirectPending = false;

async function login() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    redirectPending = true;
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Erro no login:', error);
    redirectPending = false;
  }
}

async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    redirectPending = false;
    if (result && result.user) {
      console.log("Login efetuado com sucesso:", result.user.email);
      // Aqui redirecionar para a página principal do app
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error("Erro ao obter resultado do redirect:", error);
    redirectPending = false;
  }
}

// Na inicialização
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Utilizador já autenticado:", user.email);
    window.location.href = "dashboard.html";
  } else {
    if (redirectPending) {
      await checkRedirectResult();
    } else {
      console.log("Nenhum utilizador autenticado.");
    }
  }
});

// Event listeners para botões
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('logout-btn').addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log("Logout feito.");
    window.location.href = "index.html";
  });
});
