// js/auth.js

import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

const ADMIN_EMAIL = "sabino.nelson@gmail.com";
const provider = new GoogleAuthProvider();

function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// --- LOGIN ---
const signInWithGoogle = () => {
    if (isRunningAsPWA()) {
        signInWithRedirect(auth, provider)
            .catch((error) => {
                console.error("Erro no login com redirect:", error);
                alert("Erro ao iniciar sessão. Tenta novamente.");
            });
    } else {
        signInWithPopup(auth, provider)
            .then((result) => handleLoginResult(result))
            .catch((error) => {
                console.error("Erro no login com popup:", error);
                alert("Erro ao iniciar sessão. Tenta novamente.");
            });
    }
};

const handleLoginResult = (result) => {
    const userEmail = result.user.email;
    if (userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
        console.log("Administrador logado com sucesso!", result.user);
        window.location.href = 'dashboard.html';
    } else {
        alert("Acesso negado. Esta é uma aplicação privada.");
        signOutUser();
    }
};

// --- LOGOUT ---
export const signOutUser = () => {
    signOut(auth).then(() => {
        console.log("Logout bem-sucedido.");
    }).catch((error) => {
        console.error("Erro no logout:", error);
    });
};

// --- RECUPERA REDIRECT LOGIN ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            handleLoginResult(result);
        }
    } catch (error) {
        console.error("Erro ao recuperar resultado do redirect:", error);
    }

    const loginButton = document.getElementById('login-google-btn');
    if (loginButton) {
        loginButton.addEventListener('click', signInWithGoogle);
    }

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', signOutUser);
    }
});

// --- AUTH STATE CONTROLO ---
onAuthStateChanged(auth, (user) => {
    const isPublicPage =
        window.location.pathname.endsWith('/') ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname.endsWith('login.html');

    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        if (user.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            console.warn("Utilizador não autorizado. Logout forçado.");
            signOutUser();
            return;
        }

        if (!isPublicPage && userSessionDiv && userPhotoImg) {
            userPhotoImg.src = user.photoURL || './pic/default-user.png';
            userSessionDiv.style.display = 'flex';
        }
    } else {
        if (!isPublicPage) {
            console.log("Não autenticado. A redirecionar...");
            window.location.replace('index.html');
        }
        if (userSessionDiv) {
            userSessionDiv.style.display = 'none';
        }
    }
});
