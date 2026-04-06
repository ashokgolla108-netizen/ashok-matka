import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    setPersistence,             // Added for Persistence
    browserLocalPersistence,    // Added for Persistence
    onAuthStateChanged          // Added for Auto-Login check
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDdgGqtcgvYoXmpjdIvmjlq3AkLKb5cOw0",
    authDomain: "matkaapp-267b4.firebaseapp.com",
    projectId: "matkaapp-267b4",
    databaseURL: "https://matkaapp-267b4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- ADMIN CONFIGURATION ---
const ADMIN_EMAIL = "gollaashok64@gmail.com";
let isLoginMode = true;

// --- FIX 1: AUTO-REDIRECT IF ALREADY LOGGED IN ---
// This runs immediately when the page loads
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            window.location.href = "./admin.html";
        } else {
            window.location.href = "./dashboard.html";
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const signupExtra = document.getElementById('signupExtra');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnForgot = document.getElementById('btnForgot');
    const toggleMode = document.getElementById('toggleMode');
    const msg = document.getElementById('message');
    const authSubtitle = document.getElementById('authSubtitle');

    function showStatus(text, type) {
        msg.innerText = text;
        msg.className = type === "error" ? "error-msg" : "info-msg";
        msg.style.display = "block";
        setTimeout(() => { msg.style.display = "none"; }, 5000);
    }

    btnForgot.onclick = async (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('email').value.trim();
        if (!emailVal) return showStatus("Please enter your email first!", "error");
        try {
            await sendPasswordResetEmail(auth, emailVal);
            showStatus("Reset link sent! Check your inbox.", "info");
        } catch (err) { showStatus(err.message, "error"); }
    };

    toggleMode.onclick = () => {
        isLoginMode = !isLoginMode;
        signupExtra.style.display = isLoginMode ? "none" : "block";
        btnSubmit.innerText = isLoginMode ? "Login" : "Create Account";
        authSubtitle.innerText = isLoginMode ? "Login to your account" : "Join Village45 today";
        toggleMode.innerText = isLoginMode ? "Sign Up" : "Back to Login";
        document.getElementById('toggleQuestion').innerText = isLoginMode ? "Don't have an account?" : "Already a member?";
    };

    btnSubmit.onclick = async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) return showStatus("Please fill all fields", "error");

        btnSubmit.disabled = true;
        const originalBtnText = btnSubmit.innerText;
        btnSubmit.innerText = "Connecting...";

        try {
            // --- FIX 2: SET PERSISTENCE TO LOCAL ---
            // This ensures the session is saved in the browser/app memory
            await setPersistence(auth, browserLocalPersistence);

            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                
                // Redirection will be handled by onAuthStateChanged automatically
            } else {
                const name = document.getElementById('regName').value.trim();
                const mobile = document.getElementById('regMobile').value.trim();

                if (!name || !mobile) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = originalBtnText;
                    return showStatus("Name and Mobile are required for signup", "error");
                }

                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                
                await set(ref(db, 'users/' + userCred.user.uid), {
                    name: name,
                    mobile: mobile,
                    email: email,
                    balance: 0,
                    joinedAt: Date.now(),
                    status: "Active"
                });

                // Redirection will be handled by onAuthStateChanged automatically
            }
        } catch (err) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = originalBtnText;
            showStatus(err.message, "error");
        }
    };
});
