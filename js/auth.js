// js/auth.js

import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();
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

// --- FUNÇÃO DE LOGOUT (será usada mais tarde) ---
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
    const isLoginPage = window.location.pathname.endsWith('login.html');

    if (user) {
        // O utilizador está logado.
        if (isLoginPage) {
            // Se ele está na página de login, redireciona para o dashboard.
            window.location.replace('index.html');
        }
        // Se estiver em outra página, tudo bem, ele pode ficar.
        
    } else {
        // O utilizador NÃO está logado.
        if (!isLoginPage) {
            // Se ele não está na página de login, redireciona para lá.
            console.log("Utilizador não autenticado. A redirecionar para o login...");
            window.location.replace('login.html');
        }
        // Se já estiver na página de login, não faz nada.
    }
});


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-google-btn');
    if (loginButton) {
        loginButton.addEventListener('click', signInWithGoogle);
    }
});
