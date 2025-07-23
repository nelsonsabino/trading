// js/auth.js

import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

const ADMIN_EMAIL = "o.seu.email.aqui@gmail.com"; // <-- IMPORTANTE: SUBSTITUIR PELO SEU EMAIL
const provider = new GoogleAuthProvider();

// --- FUNÇÃO DE LOGIN ---
const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const userEmail = result.user.email;
            if (userEmail === ADMIN_EMAIL) {
                console.log("Administrador logado com sucesso!", result.user);
                window.location.href = 'dashboard.html'; // Redireciona para o novo dashboard
            } else {
                alert("Acesso negado. Esta é uma aplicação privada.");
                signOutUser(); // Faz logout imediatamente
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
        // O onAuthStateChanged irá redirecionar para a landing page
    }).catch((error) => {
        console.error("Erro no logout:", error);
    });
};

// --- CONTROLO CENTRAL DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, (user) => {
    // As páginas públicas são a landing page e a página de login
    const isPublicPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('login.html');
    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        // O utilizador está logado.
        if (user.email !== ADMIN_EMAIL) {
            // Segurança extra: se um utilizador não autorizado chegar aqui, faz logout.
            signOutUser();
            return;
        }

        // Mostra a secção do utilizador nas páginas privadas
        if (!isPublicPage && userSessionDiv && userPhotoImg) {
            userPhotoImg.src = user.photoURL || './pic/default-user.png';
            userSessionDiv.style.display = 'flex';
        }
    } else {
        // O utilizador NÃO está logado.
        if (!isPublicPage) {
            // Se ele não está numa página pública, redireciona para a landing page.
            console.log("Utilizador não autenticado. A redirecionar para a página inicial...");
            window.location.replace('index.html');
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
