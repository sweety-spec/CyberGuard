import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC2GT4zaN8Jsa6B7MBIcEo1zMC1LVw42g0",
    authDomain: "authtrails-9c71e.firebaseapp.com",
    databaseURL: "https://authtrails-9c71e-default-rtdb.firebaseio.com",
    projectId: "authtrails-9c71e",
    storageBucket: "authtrails-9c71e.firebasestorage.app",
    messagingSenderId: "995557229190",
    appId: "1:995557229190:web:c66e63313d769d87bc4707"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Helper function to handle loading state
const setLoading = (isLoading) => {
    const btn = document.getElementById("submit-btn");
    const loader = document.getElementById("loader");
    const btnText = document.getElementById("btn-text");
    if (btn && loader && btnText) {
        btn.disabled = isLoading;
        loader.style.display = isLoading ? "block" : "none";
        btnText.style.opacity = isLoading ? "0.7" : "1";
    }
};

onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname;
    const isProtectedRoute = currentPage.includes("user.html") || currentPage.includes("complaint.html");
    if (!user && isProtectedRoute) {
        window.location.href = "LogIn.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Password Toggle Logic
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (toggleBtn && passwordInput) {
        toggleBtn.onclick = () => {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            toggleBtn.textContent = isPassword ? "HIDE" : "SHOW";
        };
    }

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
        submitBtn.onclick = () => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const nameInput = document.getElementById("name");

            setLoading(true); // Start Loading

            if (nameInput) {
                // Sign Up Path
                createUserWithEmailAndPassword(auth, email, password).then((res) => {
                    set(ref(db, 'users/' + res.user.uid), {
                        username: nameInput.value,
                        email: email
                    }).then(() => {
                        signOut(auth).then(() => {
                            setLoading(false);
                            alert("Account created successfully! Please Login.");
                            window.location.href = "LogIn.html";
                        });
                    });
                }).catch(err => {
                    setLoading(false);
                    alert(err.message);
                });
            } else {
                // Login Path
                setPersistence(auth, browserSessionPersistence)
                    .then(() => signInWithEmailAndPassword(auth, email, password))
                    .then(() => {
                        setLoading(false);
                        window.location.href = "user.html";
                    })
                    .catch((error) => {
                        setLoading(false);
                        alert(error.message);
                    });
            }
        };
    }

    // Forgot Password Logic
    const forgotPasswordLink = document.getElementById("forgot-password");
    if (forgotPasswordLink) {
        forgotPasswordLink.onclick = (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            if (!email) {
                alert("Please enter your email address in the email field first.");
                return;
            }
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    alert("If an account is associated with this email, a reset link has been sent.");
                })
                .catch((error) => {
                    alert("An error occurred: " + error.message);
                });
        };
    }

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
        homeBtn.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => { window.location.href = "index.html"; });
        };
    }
});

export async function adminLogin(email, password) {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        const snap = await get(ref(db, 'users/' + user.uid));
        if (!snap.exists() || snap.val().role !== "admin") {
            await signOut(auth);
            throw new Error("Access denied. Not an admin.");
        }
        window.location.href = "AdminDashboard.html";
    } catch (err) {
        throw err;
    }
};