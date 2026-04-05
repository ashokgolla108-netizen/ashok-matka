import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDdgGqtcgvYoXmpjdIvmjlq3AkLKb5cOw0",
    authDomain: "matkaapp-267b4.firebaseapp.com",
    projectId: "matkaapp-267b4",
    // Ensure this is the Singapore URL
    databaseURL: "https://matkaapp-267b4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- ADMIN CONFIGURATION ---
const ADMIN_EMAIL = "gollaashok64@gmail.com";
let isLoginMode = true;

document.addEventListener("DOMContentLoaded", () => {
    const signupExtra = document.getElementById('signupExtra');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnForgot = document.getElementById('btnForgot');
    const toggleMode = document.getElementById('toggleMode');
    const msg = document.getElementById('message');
    const authSubtitle = document.getElementById('authSubtitle');

    // Utility function to show errors/info
    function showStatus(text, type) {
        msg.innerText = text;
        msg.className = type === "error" ? "error-msg" : "info-msg";
        msg.style.display = "block";
        setTimeout(() => { msg.style.display = "none"; }, 5000);
    }

    // Forgot Password Logic
    btnForgot.onclick = async (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('email').value.trim();
        if (!emailVal) return showStatus("Please enter your email first!", "error");
        try {
            await sendPasswordResetEmail(auth, emailVal);
            showStatus("Reset link sent! Check your inbox.", "info");
        } catch (err) { showStatus(err.message, "error"); }
    };

    // Toggle between Login and Signup
    toggleMode.onclick = () => {
        isLoginMode = !isLoginMode;
        signupExtra.style.display = isLoginMode ? "none" : "block";
        btnSubmit.innerText = isLoginMode ? "Login" : "Create Account";
        authSubtitle.innerText = isLoginMode ? "Login to your account" : "Join Ashok Matka today";
        toggleMode.innerText = isLoginMode ? "Sign Up" : "Back to Login";
        document.getElementById('toggleQuestion').innerText = isLoginMode ? "Don't have an account?" : "Already a member?";
    };

    // Main Authentication Logic
    btnSubmit.onclick = async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) return showStatus("Please fill all fields", "error");

        // UI Feedback
        btnSubmit.disabled = true;
        const originalBtnText = btnSubmit.innerText;
        btnSubmit.innerText = "Connecting...";

        try {
            if (isLoginMode) {
                // --- ATTEMPT LOGIN ---
                await signInWithEmailAndPassword(auth, email, password);
                
                // Redirect based on Admin status
                if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            } else {
                // --- ATTEMPT SIGNUP ---
                const name = document.getElementById('regName').value.trim();
                const mobile = document.getElementById('regMobile').value.trim();

                if (!name || !mobile) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = originalBtnText;
                    return showStatus("Name and Mobile are required for signup", "error");
                }

                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                
                // Initialize user profile in Database
                await set(ref(db, 'users/' + userCred.user.uid), {
                    name: name,
                    mobile: mobile,
                    email: email,
                    balance: 0,
                    joinedAt: Date.now(),
                    status: "Active"
                });

                // Redirect based on Admin status (in case you signed up as admin)
                if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }
        } catch (err) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = originalBtnText;
            
            // Clean up Firebase error messages for the user
            let friendlyMsg = err.message;
            if (err.code === 'auth/user-not-found') friendlyMsg = "Account not found. Please Sign Up.";
            if (err.code === 'auth/wrong-password') friendlyMsg = "Incorrect password.";
            
            showStatus(friendlyMsg, "error");
        }
    };
});
