// auth.js
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

import { auth } from './firebase-service.js';

const ADMIN_EMAIL = "o.seu.email@gmail.com";
const provider = new GoogleAuthProvider();

// Define persistência antes de qualquer outra operação
await setPersistence(auth, browserLocalPersistence);

// LOGIN
const signInWithGoogle = () => {
  sessionStorage.setItem('authRedirect', 'true');
  localStorage.removeItem('userLoggedOut');
  signInWithRedirect(auth, provider);
};

// LOGOUT
export const signOutUser = () => {
  localStorage.setItem('userLoggedOut', 'true');
  signOut(auth).then(() => {
    console.log("Logout feito com sucesso.");
    window.location.replace('index.html');
  });
};

// Esta função controla tudo
const handleAuth = async () => {
  try {
    const result = await getRedirectResult(auth);
    sessionStorage.removeItem('authRedirect');

    if (result?.user) {
      if (result.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        alert("Conta não autorizada.");
        return signOutUser();
      }

      if (!window.location.pathname.endsWith('dashboard.html')) {
        window.location.href = 'dashboard.html';
      }
      return;
    }

    // Só agora avaliamos o estado da auth
    onAuthStateChanged(auth, (user) => {
      const isPublic =
        window.location.pathname.endsWith('/') ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname.endsWith('login.html');

      if (user) {
        if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          return signOutUser();
        }

        const userPhoto = document.getElementById('user-photo');
        const sessionDiv = document.getElementById('user-session');
        if (userPhoto) userPhoto.src = user.photoURL;
        if (sessionDiv) sessionDiv.style.display = 'flex';

      } else {
        const isRedirecting = sessionStorage.getItem('authRedirect') === 'true';
        const isLogout = localStorage.getItem('userLoggedOut') === 'true';

        if (!isPublic && !isRedirecting && !isLogout) {
          console.log("Utilizador não autenticado. A redirecionar para login.");
          sessionStorage.setItem('authRedirect', 'true');
          signInWithRedirect(auth, provider);
        }

        const sessionDiv = document.getElementById('user-session');
        if (sessionDiv) sessionDiv.style.display = 'none';
      }
    });

  } catch (error) {
    console.error("Erro na autenticação:", error);
    sessionStorage.removeItem('authRedirect');
  }
};

// Run logo ao carregar
handleAuth();

// Botões
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-google-btn');
  if (loginBtn) loginBtn.addEventListener('click', signInWithGoogle);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', signOutUser);
});
