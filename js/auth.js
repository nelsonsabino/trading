// js/auth.js

import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut,
    signInWithRedirect, // Para re-autenticação silenciosa
    getRedirectResult // Para obter o resultado do redirecionamento
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebase-service.js';

const ADMIN_EMAIL = "o.seu.email.aqui@gmail.com"; // Lembre-se de substituir
const provider = new GoogleAuthProvider();

// --- FUNÇÃO DE LOGIN ---
const signInWithGoogle = () => {
    localStorage.removeItem('userLoggedOut'); // Limpa a bandeira de logout intencional
    sessionStorage.setItem('authRedirect', 'true'); // Define a bandeira antes de redirecionar
    signInWithRedirect(auth, provider);
};

// --- FUNÇÃO DE LOGOUT ---
export const signOutUser = () => {
    localStorage.setItem('userLoggedOut', 'true'); // Define a bandeira de logout intencional
    signOut(auth).then(() => {
        console.log("Logout bem-sucedido.");
        // O onAuthStateChanged agora vai detetar o logout e redirecionar corretamente
    }).catch((error) => {
        console.error("Erro no logout:", error);
    });
};

// --- LÓGICA DE GESTÃO DO RESULTADO DO REDIRECIONAMENTO ---
// Esta parte executa quando a página carrega após um redirecionamento do Google
getRedirectResult(auth)
    .then((result) => {
        sessionStorage.removeItem('authRedirect'); // Limpa a bandeira assim que o resultado é processado
        if (result && result.user) {
            // O utilizador acabou de fazer login via redirect
            const userEmail = result.user.email;
            if (userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
                console.log("Administrador logado com sucesso via redirect!", result.user);
                // Garante que o utilizador vai para o dashboard após o login
                if (!window.location.pathname.endsWith('dashboard.html')) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                alert("Acesso negado. Esta é uma aplicação privada.");
                signOutUser();
            }
        }
    }).catch((error) => {
        sessionStorage.removeItem('authRedirect'); // Limpa a bandeira também em caso de erro
        console.error("Erro ao obter o resultado do redirecionamento:", error);
    });


// --- CONTROLO CENTRAL DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, (user) => {
    const isPublicPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('login.html');
    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    if (user) {
        // O utilizador está logado.
        if (user.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            // Segurança extra: se um utilizador não autorizado chegar aqui, faz logout.
            console.warn("Utilizador logado não autorizado. A fazer logout.");
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
        const userLoggedOut = localStorage.getItem('userLoggedOut') === 'true';
        const isAuthRedirect = sessionStorage.getItem('authRedirect') === 'true'; // Verifica se estamos a meio de um redirect

        if (!isPublicPage) {
            // Se não está numa página pública, precisa de autenticação.
            if (userLoggedOut) {
                // Se o utilizador fez logout de propósito, vai para a landing page.
                console.log("Utilizador fez logout explícito. A redirecionar para a página inicial...");
                window.location.replace('index.html');
            } else if (!isAuthRedirect) { // SÓ TENTA re-autenticar se NÃO estivermos a meio de um redirect
                // Se não fez logout, tenta a re-autenticação silenciosa.
                console.log("Sessão não encontrada, a tentar re-autenticação silenciosa...");
                sessionStorage.setItem('authRedirect', 'true'); // Define a bandeira
                signInWithRedirect(auth, provider);
            }
            // Se isAuthRedirect for true, não faz nada e espera que o getRedirectResult resolva.
        } else {
           // Se está numa página pública e fez logout, limpa a bandeira.
           if (userLoggedOut) {
               localStorage.removeItem('userLoggedOut');
           }
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
