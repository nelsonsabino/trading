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
let redirectHandled = false;

function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

function setRedirectPending(value) {
    localStorage.setItem('redirectPending', value ? 'true' : 'false');
}

function isRedirectPending() {
    return localStorage.getItem('redirectPending') === 'true';
}

export const signOutUser = () => {
    localStorage.removeItem('redirectPending');
    signOut(auth).then(() => {
        console.log("Logout feito.");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
};

async function signInWithGoogle() {
    try {
        await setPersistence(auth, browserLocalPersistence);

        if (isPWA()) {
            if (!isRedirectPending()) {
                setRedirectPending(true);
                await signInWithRedirect(auth, provider);
            } else {
                console.log("Redirect já pendente...");
            }
        } else {
            const result = await signInWithPopup(auth, provider);
            handleLoginResult(result);
        }
    } catch (error) {
        console.error("Erro no login:", error);
        setRedirectPending(false);
    }
}

function handleLoginResult(result) {
    const email = result.user.email;
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log("Autenticação bem-sucedida.");
        setRedirectPending(false);
        window.location.href = "dashboard.html";
    } else {
        alert("Acesso negado. Esta é uma aplicação privada.");
        signOutUser();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user && !redirectHandled) {
            redirectHandled = true;
            handleLoginResult(result);
            return;
        }
    } catch (error) {
        console.error("Erro no getRedirectResult:", error);
        setRedirectPending(false);
    }

    const loginBtn = document.getElementById('login-google-btn');
    if (loginBtn) loginBtn.addEventListener('click', signInWithGoogle);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', signOutUser);
});

onAuthStateChanged(auth, (user) => {
    const isPublicPage =
        location.pathname.endsWith('/') ||
        location.pathname.endsWith('index.html') ||
        location.pathname.endsWith('login.html');

    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            signOutUser();
            return;
        }

        if (!isPublicPage) {
            if (userPhotoImg) userPhotoImg.src = user.photoURL;
            if (userSessionDiv) userSessionDiv.style.display = 'flex';
        }

        // Reset redirect pending (login concluído com sucesso)
        setRedirectPending(false);
    } else {
        if (!isPublicPage && !isRedirectPending()) {
            console.log("Utilizador não autenticado. A redirecionar.");
            window.location.href = "index.html";
        }

        if (userSessionDiv) userSessionDiv.style.display = 'none';
    }
});

