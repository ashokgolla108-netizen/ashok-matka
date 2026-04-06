import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    sendPasswordResetEmail, setPersistence, browserLocalPersistence, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdgGqtcgvYoXmpjdIvmjlq3AkLKb5cOw0",
    authDomain: "matkaapp-267b4.firebaseapp.com",
    projectId: "matkaapp-267b4",
    databaseURL: "https://matkaapp-267b4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const ADMIN_EMAIL = "gollaashok64@gmail.com";
let isLoginMode = true;

// AUTO-REDIRECT IF SESSION EXISTS
onAuthStateChanged(auth, (user) => {
    if (user) {
        const path = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "./admin.html" : "./dashboard.html";
        window.location.href = path;
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
        if (!emailVal) return showStatus("Enter email first!", "error");
        try {
            await sendPasswordResetEmail(auth, emailVal);
            showStatus("Reset link sent!", "info");
        } catch (err) { showStatus(err.message, "error"); }
    };

    toggleMode.onclick = () => {
        isLoginMode = !isLoginMode;
        signupExtra.style.display = isLoginMode ? "none" : "block";
        btnSubmit.innerText = isLoginMode ? "Login" : "Create Account";
        toggleMode.innerText = isLoginMode ? "Sign Up" : "Back to Login";
    };

    btnSubmit.onclick = async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (!email || !password) return showStatus("Fill all fields", "error");

        btnSubmit.disabled = true;
        btnSubmit.innerText = "Connecting...";

        try {
            await setPersistence(auth, browserLocalPersistence);
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const name = document.getElementById('regName').value.trim();
                const mobile = document.getElementById('regMobile').value.trim();
                if (!name || !mobile) throw new Error("Name and Mobile required");

                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await set(ref(db, 'users/' + userCred.user.uid), {
                    name: name,
                    mobile: mobile,
                    email: email,
                    balance: 0,
                    joinedAt: Date.now(),
                    status: "Active"
                });
            }
        } catch (err) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = isLoginMode ? "Login" : "Create Account";
            showStatus(err.message, "error");
        }
    };
});
