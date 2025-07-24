// js/auth.js

import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

const ADMIN_EMAIL = "sabino.nelson@gmail.com";
const provider = new GoogleAuthProvider();

function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// ---------- LOGIN ----------
const signInWithGoogle = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence); // Garante que mantém login após fecho da app

        // Anti-loop: impede múltiplos redireccionamentos em sequência
        if (sessionStorage.getItem('authPending') === 'true') {
            console.warn("Autenticação já em curso. Ignorado.");
            return;
        }

        sessionStorage.setItem('authPending', 'true');

        if (isRunningAsPWA()) {
            await signInWithRedirect(auth, provider);
        } else {
            const result = await signInWithPopup(auth, provider);
            handleLoginResult(result);
        }
    } catch (error) {
        console.error("Erro no login:", error);
        sessionStorage.removeItem('authPending');
        alert("Erro ao iniciar sessão. Tenta novamente.");
    }
};

const handleLoginResult = (result) => {
    const userEmail = result.user.email;
    if (userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
        console.log("Administrador autenticado.");
        sessionStorage.removeItem('authPending');
        window.location.href = 'dashboard.html';
    } else {
        alert("Acesso negado. Esta é uma aplicação privada.");
        signOutUser();
    }
};

// ---------- LOGOUT ----------
export const signOutUser = () => {
    sessionStorage.removeItem('authPending');
    signOut(auth).then(() => {
        console.log("Logout feito.");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
};

// ---------- REDIRECT RESULT ----------
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            handleLoginResult(result);
            return;
        }
    } catch (error) {
        console.error("Erro ao obter resultado do redirect:", error);
        sessionStorage.removeItem('authPending');
    }

    const loginBtn = document.getElementById('login-google-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', signInWithGoogle);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', signOutUser);
    }
});

// ---------- AUTH STATE ----------
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
