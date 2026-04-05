import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdgGqtcgvYoXmpjdIvmjlq3AkLKb5cOw0",
    authDomain: "matkaapp-267b4.firebaseapp.com",
    projectId: "matkaapp-267b4",
    databaseURL: "https://matkaapp-267b4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const ADMIN_EMAIL = "gollaashok64@gmail.com";

const handleAuth = async (type) => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('message');
    try {
        if (type === 'login') {
            await signInWithEmailAndPassword(auth, e, p);
            window.location.href = (e.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? "admin.html" : "dashboard.html";
        } else {
            await createUserWithEmailAndPassword(auth, e, p);
            window.location.href = "dashboard.html";
        }
    } catch (err) { msg.innerText = err.message; }
};

document.getElementById('btnLogin').onclick = () => handleAuth('login');
document.getElementById('btnSignup').onclick = () => handleAuth('signup');
