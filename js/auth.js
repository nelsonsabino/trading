// js/auth.js

import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js'; // NOVO: Importa o auth já inicializado

const provider = new GoogleAuthProvider();

// --- FUNÇÃO DE LOGIN ---
const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            // Login bem-sucedido, o onAuthStateChanged irá redirecionar
            console.log("Login com Google bem-sucedido!", result.user);
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
        // O onAuthStateChanged irá redirecionar para a página de login
    }).catch((error) => {
        console.error("Erro no logout:", error);
    });
};

// --- CONTROLO CENTRAL DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/'; // Considera a raiz como página de login
    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        // O utilizador está logado.
        if (isLoginPage) {
            // Se ele está na página de login, redireciona para o dashboard.
            window.location.replace('index.html');
        } else {
           // Mostra a secção do utilizador e preenche os dados
           if (userSessionDiv && userPhotoImg) {
               userPhotoImg.src = user.photoURL || './pic/default-user.png'; // Usa uma imagem padrão se não houver foto
               userSessionDiv.style.display = 'flex';
           }
        }
    } else {
        // O utilizador NÃO está logado.
        if (!isLoginPage) {
            // Se ele não está na página de login, redireciona para lá.
            console.log("Utilizador não autenticado. A redirecionar para o login...");
            window.location.replace('login.html');
        }
       // Esconde a secção do utilizador se ele não estiver logado
       if (userSessionDiv) {
           userSessionDiv.style.display = 'none';
       }
    }
});


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-google-btn');
    if (loginButton) {
        loginButton.addEventListener('click', signInWithGoogle);
    }
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', signOutUser);
    }
});
