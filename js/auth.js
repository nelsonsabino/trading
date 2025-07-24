// js/auth.js

import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    signInWithRedirect,
    getRedirectResult,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

// --- DEFINIR PERSISTÊNCIA DURÁVEL ---
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Persistência definida para localStorage.");
    })
    .catch((error) => {
        console.error("Erro ao definir persistência:", error);
    });

const ADMIN_EMAIL = "o.seu.email.aqui@gmail.com"; // Substituir pelo teu e-mail real
const provider = new GoogleAuthProvider();

// --- FUNÇÃO DE LOGIN ---
const signInWithGoogle = () => {
    localStorage.removeItem('userLoggedOut'); // Limpa flag de logout intencional
    sessionStorage.setItem('authRedirect', 'true'); // Define flag de redirect
    signInWithRedirect(auth, provider);
};

// --- FUNÇÃO DE LOGOUT ---
export const signOutUser = () => {
    localStorage.setItem('userLoggedOut', 'true'); // Define flag de logout
    signOut(auth)
        .then(() => {
            console.log("Logout bem-sucedido.");
        })
        .catch((error) => {
            console.error("Erro no logout:", error);
        });
};

// --- GESTÃO DO RESULTADO DO REDIRECT ---
getRedirectResult(auth)
    .then((result) => {
        sessionStorage.removeItem('authRedirect'); // Limpa flag mesmo em sucesso
        if (result && result.user) {
            const userEmail = result.user.email;
            if (userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
                console.log("Administrador autenticado com sucesso.");
                if (!window.location.pathname.endsWith('dashboard.html')) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                alert("Acesso negado. Esta é uma aplicação privada.");
                signOutUser();
            }
        }
    })
    .catch((error) => {
        sessionStorage.removeItem('authRedirect'); // Limpa mesmo em erro
        console.error("Erro no redirect:", error);
    });

// --- CONTROLO GERAL DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, (user) => {
    const isPublicPage =
        window.location.pathname.endsWith('/') ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname.endsWith('login.html');

    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        // Verifica se o utilizador é o admin
        if (user.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            console.warn("Utilizador não autorizado. A terminar sessão.");
            signOutUser();
            return;
        }

        // Mostra avatar se estiver na página privada
        if (!isPublicPage && userSessionDiv && userPhotoImg) {
            userPhotoImg.src = user.photoURL || './pic/default-user.png';
            userSessionDiv.style.display = 'flex';
        }

    } else {
        const userLoggedOut = localStorage.getItem('userLoggedOut') === 'true';
        const isAuthRedirect = sessionStorage.getItem('authRedirect') === 'true';

        if (!isPublicPage) {
            if (userLoggedOut) {
                console.log("Logout manual detectado. A redirecionar...");
                window.location.replace('index.html');
            } else if (!isAuthRedirect) {
                console.log("Sessão em falta. A iniciar redirect...");
                sessionStorage.setItem('authRedirect', 'true');
                signInWithRedirect(auth, provider);
            }
        } else {
            if (userLoggedOut) {
                localStorage.removeItem('userLoggedOut');
            }
        }

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
