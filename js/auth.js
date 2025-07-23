// js/auth.js

import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

const provider = new GoogleAuthProvider();

// --- FUNÇÃO DE LOGIN ---
const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Login com Google bem-sucedido!", result.user);
            // AGORA, esta função trata do redirecionamento após o sucesso.
            window.location.href = 'index.html';
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
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/';
    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        // O utilizador está logado.
        // Apenas mostra ou esconde a informação do utilizador. Não redireciona daqui.
        if (!isLoginPage && userSessionDiv && userPhotoImg) {
            userPhotoImg.src = user.photoURL || './pic/default-user.png';
            userSessionDiv.style.display = 'flex';
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
