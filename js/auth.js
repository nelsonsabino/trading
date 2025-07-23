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
            
            // DEBUG: Mostra na consola o que estamos a comparar
            console.log("Email do Utilizador (Google):", `'${userEmail}'`);
            console.log("Email de Administrador (Código):", `'${ADMIN_EMAIL}'`);
            
            // COMPARAÇÃO ROBUSTA: ignora maiúsculas/minúsculas e espaços
            if (userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
                console.log("Administrador logado com sucesso!", result.user);
+               sessionStorage.setItem('justLoggedIn', 'true'); // NOVO: Flag de login recente
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
    // Definir os tipos de página com base no pathname
    const currentPathname = window.location.pathname;
    const isPublicLandingPage = currentPathname === '/' || currentPathname.endsWith('index.html');
    const isLoginPage = currentPathname.endsWith('login.html');
    const isProtectedPage = !(isPublicLandingPage || isLoginPage); // Qualquer página que não seja pública ou de login

    const userSessionDiv = document.getElementById('user-session');
    const userPhotoImg = document.getElementById('user-photo');

    // Flag para saber se acabamos de fazer login
    const justLoggedInFlag = sessionStorage.getItem('justLoggedIn');

    // DEBUGGING AVANÇADO (descomentar para depurar o loop)
    console.log(`[AUTH STATE] User: ${user ? user.email : 'NULL'} | Path: '${currentPathname}' | Protected: ${isProtectedPage} | Just Logged In: ${justLoggedInFlag}`);


    if (user) {
        // --- UTILIZADOR ESTÁ LOGADO ---

        // Limpa a flag 'justLoggedIn' se um utilizador válido está logado.
        if (justLoggedInFlag) {
            sessionStorage.removeItem('justLoggedIn');
        }

        // 1. Verificar se é o ADMINISTRADOR
        if (user.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            console.warn("Utilizador logado não autorizado. A fazer logout.");
            signOutUser();
            return; // Termina a execução
        }

        // 2. Se for o administrador e estiver numa página pública (landing ou login), redireciona para o dashboard
        // Exclui a página de dashboard para evitar redirecionamento cíclico se o pathname acabar em dashboard.html
        if ((isPublicLandingPage || isLoginPage) && !currentPathname.endsWith('dashboard.html')) {
            console.log("[AUTH] Admin logado em página pública. Redirecionando para o dashboard.");
            window.location.replace('dashboard.html'); // Usa replace para não guardar no histórico
            return; // Termina a execução
        }

        // 3. Se for o administrador e estiver numa página protegida (incluindo o dashboard), mostra info do utilizador
        if (isProtectedPage && userSessionDiv && userPhotoImg) {
            userPhotoImg.src = user.photoURL || './pic/default-user.png';
            userSessionDiv.style.display = 'flex';
        }

    } else {
        // --- UTILIZADOR NÃO ESTÁ LOGADO ---

        // Se a flag 'justLoggedIn' está ativa e o user é NULL, significa que o Firebase Auth
        // ainda não restabeleceu a sessão. Não fazer redirecionamento.
        if (justLoggedInFlag === 'true') {
            console.log("[AUTH] Flag 'justLoggedIn' ativa, user é temporariamente NULL. A aguardar.");
            // Não removemos a flag aqui; ela será limpa quando o utilizador for detetado (ou em caso de falha de login).
            return; 
        }

        // Se o utilizador NÃO está logado e está numa página protegida, redireciona para a landing page (index.html)
        if (isProtectedPage) {
            console.log("Utilizador não autenticado em página protegida. A redirecionar para a landing page...");
            window.location.replace('index.html'); // Usa replace
            return; // Termina a execução
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
