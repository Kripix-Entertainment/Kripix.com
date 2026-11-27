import { auth, db } from './script.js';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const btn = this.querySelector('button');

    btn.innerHTML = 'VERIFICA NEL CLOUD...';
    btn.style.pointerEvents = 'none';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (!firebaseUser.emailVerified) {
            // IL LIMBO
            document.getElementById('loginForm').innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color:var(--accent-gold);">AUTORIZZAZIONE IN SOSPESO</h3>
                    <p style="color:var(--text-muted);">L'email ${email} non è verificata.</p>
                    <button id="btn-resend" class="btn-outline full-width">RE-INVIA MAIL DI VERIFICA</button>
                    <p id="limbo-msg" style="margin-top:15px; display:none;"></p>
                </div>
            `;
            document.getElementById('btn-resend').addEventListener('click', async () => {
                await sendEmailVerification(firebaseUser);
                document.getElementById('limbo-msg').innerText = "Mail inviata.";
                document.getElementById('limbo-msg').style.display = "block";
            });
            await signOut(auth); // Sconnette l'utente non verificato
            throw new Error("email-limbo"); 
        }

        // SUCCESSO
        btn.innerHTML = 'ACCESSO CONSENTITO';
        btn.style.background = 'var(--success)';
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);

    } catch (error) {
        if(error.message === "email-limbo") return;
        
        const msg = document.getElementById('err-login');
        msg.innerText = 'Email o password non corrette.';
        msg.style.display = 'block';
        btn.innerHTML = 'VERIFICA CREDENZIALI';
        btn.style.pointerEvents = 'auto';
    }
});