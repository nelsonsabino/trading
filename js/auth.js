import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, getRedirectResult } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

const ADMIN_EMAIL = "sabino.nelson@gmail.com"; // <-- IMPORTANTE: SUBSTITUIR PELO SEU EMAIL
const provider = new GoogleAuthProvider();

// --- FUNÇÃO DE LOGIN ---
const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const userEmail = result.user.email;
      console.log("Email do Utilizador (Google):", `'${userEmail}'`);
      console.log("Email de Administrador (Código):", `'${ADMIN_EMAIL}'`);
      if (userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
        console.log("Administrador logado com sucesso!", result.user);
        window.location.href = 'dashboard.html';
      } else {
        alert("Acesso negado. Esta é uma aplicação privada.");
        signOutUser();
      }
    })
    .catch((error) => {
      console.error("Erro no login com Google:", error);
      alert("Ocorreu um erro durante o login. Por favor, tente novamente.");
    });
};

// --- FUNÇÃO DE LOGOUT ---
export const signOutUser = () => {
  signOut(auth).then(() => {
    console.log("Logout bem-sucedido.");
  }).catch((error) => {
    console.error("Erro no logout:", error);
  });
};

// --- CONTROLO CENTRAL DE AUTENTICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  // Exibe um indicador de carregamento enquanto verifica a sessão
  console.log("Página carregada, verificando estado de autenticação...");
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }

  // Aguarda a verificação da sessão
  getRedirectResult(auth).then(() => {
    onAuthStateChanged(auth, (user) => {
      console.log("onAuthStateChanged chamado. Usuário:", user ? user.email : "Nenhum usuário logado");
      const isPublicPage = window.location.pathname.endsWith('/') || 
                          window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('login.html');
      const userSessionDiv = document.getElementById('user-session');
      const userPhotoImg = document.getElementById('user-photo');

      if (user) {
        console.log("onAuthStateChanged - Email do Utilizador:", `'${user.email}'`);
        console.log("onAuthStateChanged - Email de Administrador:", `'${ADMIN_EMAIL}'`);
        if (user.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
          console.warn("Utilizador logado não autorizado. A fazer logout.");
          signOutUser();
          return;
        }
        if (!isPublicPage && userSessionDiv && userPhotoImg) {
          userPhotoImg.src = user.photoURL || './pic/default-user.png';
          userSessionDiv.style.display = 'flex';
        }
        if (isPublicPage) {
          console.log("Usuário autenticado, redirecionando para dashboard...");
          window.location.href = 'dashboard.html';
        }
      } else {
        console.log("Nenhum usuário autenticado detectado.");
        if (!isPublicPage) {
          console.log("Utilizador não autenticado. A redirecionar para a página inicial...");
          window.location.replace('index.html');
        }
        if (userSessionDiv) {
          userSessionDiv.style.display = 'none';
        }
      }
      // Esconde o indicador de carregamento após verificar a sessão
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
    });
  }).catch((error) => {
    console.error("Erro ao verificar resultado de redirecionamento:", error);
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  });

  const loginButton = document.getElementById('login-google-btn');
  if (loginButton) {
    loginButton.addEventListener('click', signInWithGoogle);
  }
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', signOutUser);
  }
});
