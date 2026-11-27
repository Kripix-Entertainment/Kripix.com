// ============================================================
//  TRANSLATOR.JS — Kripix Entertainment
//  Sistema di traduzione IT ↔ EN con supporto data-i18n
//  e fallback su text-node matching per retrocompatibilità.
// ============================================================


// ── DIZIONARIO IT → EN ──────────────────────────────────────

const dizionario_EN = {

    // ── Componenti globali (Navbar & Footer) ────────────────
    "Progetti": "Projects",
    "Chi Siamo": "About Us",
    "Contatti": "Contact",
    "Scarica App": "Download App",
    "Assistenza": "Support",
    "Centro assistenza": "Help center",
    "Torna in cima alla pagina": "Back to top of page",
    "Apri il menu": "Open the menu",
    "Apri contatti": "Open contacts",
    "Accedi": "Login",
    "Il mio profilo": "My profile",
    "Libreria Giochi": "Game Library",
    "Impostazioni": "Settings",
    "Pannello admin": "Admin panel",
    "Disconnetti": "Disconnect",
    "Scollegati (Errore Database)": "Disconnect (Database Error)",
    "Account fantasma": "Ghost account",
    "Giocatore": "Player",
    "← Torna alla home": "← Return to home",
    "← Torna a Kripix": "← Return to network",
    "← Annulla": "← Cancel",
    "← Torna al catalogo": "← Return to catalog",
    "← Torna al login": "← Return to login",
    "← Esci dal terminale": "← Exit terminal",
    "Annulla": "Cancel",
    "Chiudi": "Close",
    "Sviluppato in Italia.": "Developed in Italy.",
    "Network": "Network",
    "Progetti & Giochi": "Projects & Games",
    "Lo Studio": "The Studio",
    "Kripix Launcher": "Kripix Launcher",
    "Archivi": "Archives",
    "Termini d'uso": "Terms of use",
    "Privacy Policy": "Privacy Policy",
    "Politica DRM": "DRM Policy",
    "Domande Frequenti": "Frequently Asked Questions",
    "Connessioni": "Connections",
    "Discord Server": "Discord Server",
    "Twitter / X": "Twitter / X",
    "YouTube": "YouTube",
    "Tutti i diritti riservati.": "All rights reserved.",

    // ── Index (Home) ────────────────────────────────────────
    "I Nostri Giochi": "Our Games",
    "La Nostra Visione": "Our Vision",
    "Intercettazione segnali di rete...": "Intercepting network signals...",
    "Nessuna comunicazione attiva.": "No active communications.",

    // ── Studio (Chi Siamo) ──────────────────────────────────
    "Lo studio": "The studio",
    "La nostra missione": "Our mission",
    "Da Kripix Entertainment, crediamo che i videogiochi siano la forma d'arte più potente del nostro tempo. Non creiamo semplici passatempi, ma mondi immersivi e atmosfere dense che sfidano l'intelletto.": "At Kripix Entertainment, we believe video games are the most powerful art form of our time. We don't create simple pastimes, but immersive worlds and dense atmospheres that challenge the intellect.",
    "I 4 pilastri": "The 4 pillars",
    "01. Atmosfera è regina": "01. Atmosphere is queen",
    "Non è un contorno, è il fondamento. Ogni ombra, ogni suono deve servire a costruire un mondo credibile.": "It is not a background element, it is the foundation. Every shadow, every sound must serve to build a credible world.",
    "02. Il gameplay ha un senso": "02. Gameplay has meaning",
    "Rifiutiamo le meccaniche inutili. Le azioni del giocatore devono avere conseguenze tangibili.": "We reject pointless mechanics. The player's actions must have tangible consequences.",
    "03. Narrazione interattiva": "03. Interactive narrative",
    "Non ci limitiamo a raccontare una storia; diamo al giocatore gli strumenti per scoprirla.": "We don't just tell a story; we give the player the tools to uncover it.",
    "04. Qualità sulla quantità": "04. Quality over quantity",
    "Preferiamo creare 10 ore indimenticabili piuttosto che 100 ore di contenuti ripetitivi.": "We prefer to create 10 unforgettable hours rather than 100 hours of repetitive content.",

    // ── Contatti ─────────────────────────────────────────────
    "Parla con noi": "Talk to us",
    "Info": "Info",
    "Siamo sempre alla ricerca di collaboratori, feedback o opportunità di publishing.": "We are always looking for collaborators, feedback, or publishing opportunities.",
    "Nome utente / nome": "Username / name",
    "Il tuo nome": "Your name",
    "Email": "Email",
    "latua@email.com": "your@email.com",
    "Messaggio / dossier": "Message / dossier",
    "Scrivi qui il tuo feedback o richiesta...": "Write your feedback or request here...",
    "Trasmetti dati": "Transmit data",
    "Risposta immediata": "Instant answer",
    "Account, acquisti, chiavi e launcher: le domande più comuni hanno già una risposta pronta.": "Account, purchases, keys and launcher: the most common questions already have an answer waiting.",
    "Vai alle FAQ": "Go to the FAQ",

    // ── Progetti & Pagoda ───────────────────────────────────
    "Catalogo progetti": "Project catalog",
    "Il filo del dubbio": "A thread of doubt",
    "In sviluppo | PC | 2026": "In development | PC | 2026",
    "Un thriller noir psicologico dove ogni fallimento investigativo rende i tuoi nemici più forti. Harrow ti aspetta.": "A psychological noir thriller where every investigative failure makes your enemies stronger. Harrow awaits.",
    "Edizione Standard": "Standard Edition",
    "Migliore offerta": "Best value",
    "Include DELUXE EDITION": "Includes DELUXE EDITION",
    "(Soundtrack + Artbook + Skin)": "(Soundtrack + Artbook + Skin)",
    "Acquista Ora": "Buy Now",
    "Key Steam Inclusa • 100% Supporto Sviluppatori": "Steam Key Included • 100% Developer Support",
    "Annuncio": "Announcement",
    "Progetto segreto": "Classified project",
    "Pre-produzione": "Pre-production",
    "Un nuovo capitolo nell'universo Kripix.": "A new chapter in the Kripix universe.",
    "Realismo Sporco Noir": "Dirty Noir Realism",
    "1973. Harrow non è solo un'ambientazione, è un personaggio antagonista. Una città avvolta da pioggia incessante, nebbia e decadenza morale.": "1973. Harrow isn't just a setting, it's an antagonistic character. A city shrouded in relentless rain, fog, and moral decay.",
    "Acquisici licenza": "Acquire license",
    "Il cervello e i muscoli": "Brains and brawn",
    "Vestirai i panni di William Joshmite Holloway, un detective \"Double-Face\". Incredibilmente intelligente nelle deduzioni e nella manipolazione psicologica, ma goffo e disperato nel combattimento corpo a corpo. La tua mira trema, i pugni sono pesanti, ogni rissa può essere l'ultima.": "You will play as William Joshmite Holloway, a 'Two-Faced' detective. Incredibly intelligent in deductions and psychological manipulation, but clumsy and desperate in hand-to-hand combat. Your aim shakes, your punches are heavy, every brawl could be your last.",
    "L'ia direttore": "The AI director",
    "Il gioco rifiuta le convenzioni arcade. Non esiste \"Detective Vision\". Se fallisci un minigioco deduttivo, il mondo reagisce: i nemici entrano in allerta, piazzano trappole sonore e ti braccano. L'IA impara il tuo stile: troppo stealth? Aggiungeranno telecamere. Troppo aggressivo? Arriveranno i Bruti.": "The game rejects arcade conventions. There is no 'Detective Vision'. If you fail a deductive minigame, the world reacts: enemies go on high alert, set sound traps, and hunt you down. The AI learns your style: too stealthy? They'll add cameras. Too aggressive? The Brutes will arrive.",
    "I luogotenenti di russo": "Russo's lieutenants",
    "Quattro ostacoli mortali prima del Don.": "Four deadly obstacles before the Don.",
    "Il Macellaio": "The Butcher",
    "Forza Bruta": "Brute Force",
    "Sadico e spietato. Una lotta puramente viscerale nei sotterranei dei rulli trasportatori.": "Sadistic and ruthless. A purely visceral fight in the conveyor belt underground.",
    "Il Ragioniere": "The Accountant",
    "Intelletto Paranoico": "Paranoid Intellect",
    "Arthur Finch combatte con le trappole al buio. Per ucciderlo, dovrai distruggere il suo ego.": "Arthur Finch fights with traps in the dark. To kill him, you must destroy his ego.",
    "Il Fantasma": "The Ghost",
    "Perfezione Letale": "Lethal Perfection",
    "Angelo Conti. Un duello al buio basato sull'audio 3D. Un'arte marziale letale, una morte rispettosa.": "Angelo Conti. A duel in the dark based on 3D audio. A lethal martial art, a respectful death.",
    "Il Re del Passato": "The King of the Past",
    "Il Don. La resa dei conti sotto la pioggia nel fango, dove la verità sarà più letale dei proiettili.": "The Don. The showdown in the rain and mud, where the truth will be deadlier than bullets.",
    "La critica": "Critical acclaim",
    "Classificazione: Capolavoro Assoluto": "Classification: Absolute Masterpiece",
    "Protocollo di sistema richiesto (Pixel Otros engine)": "Required system protocol (Pixel Otros engine)",
    "Minimi": "Minimum",
    "Raccomandati": "Recommended",
    "[SSD NVMe OBBLIGATORIO]": "[NVMe SSD MANDATORY]",
    "[SSD Gen4 NVMe]": "[Gen4 NVMe SSD]",
    "Il filo del dubbio - Deluxe Edition": "A thread of doubt - Deluxe Edition",
    "Include OST Industrial Jazz e Artbook Digitale.": "Includes Industrial Jazz OST and Digital Artbook.",
    "(No DRM)": "(No DRM)",

    // ── Download ─────────────────────────────────────────────
    "Kripix Launcher": "Kripix Launcher",
    "Il tuo portale per Harrow e oltre.": "Your portal for Harrow and beyond.",
    "Rilevato": "Detected",
    "Scarica .exe": "Download .exe",
    "Scarica .dmg": "Download .dmg",
    "Grazie! Il download è iniziato.": "Thank you! The download has started.",
    "Scaricando...": "Downloading...",
    "Grazie!": "Thank you!",
    "Aggiornamenti Rapidi": "Fast Updates",
    "Ultima versione sempre disponibile.": "Latest version always available.",
    "Cloud Save": "Cloud Save",
    "Progressi al sicuro nel cloud.": "Progress safely stored in the cloud.",
    "Bonus Esclusivi": "Exclusive Bonuses",
    "Contenuti extra per gli utenti.": "Extra content for users.",
    "Accesso sviluppatori": "Developer access",
    "Forgiare la realtà": "Forging reality",
    "Non cerchiamo creatori di giochi. Cerchiamo architetti di mondi. Scopri Pixel Otros, il nostro motore proprietario basato su streaming SSD e rendering Nanovoxel.": "We don't look for game creators. We look for world architects. Discover Pixel Otros, our proprietary engine based on SSD streaming and Nanovoxel rendering.",
    "Entra nel programma dev": "Join the dev program",

    // ── Engine ───────────────────────────────────────────────
    "Developer kit[alpha]": "Developer kit[alpha]",
    "The Ultimate Storytelling Engine.": "The Ultimate Storytelling Engine.",
    "Attenzione: architettura ad alto costo": "Warning: high-cost architecture",
    "Pixel Otros non è progettato per la scalabilità. Utilizza una tecnologia di Streaming SSD Diretto che bypassa la RAM di sistema per caricare texture non compresse. Questo motore è creato per un solo scopo: Iper-Realismo Narrativo.": "Pixel Otros is not designed for scalability. It uses Direct SSD Streaming technology that bypasses system RAM to load uncompressed textures. This engine is created for a single purpose: Narrative Hyper-Realism.",
    "Le texture vengono lette direttamente dall'NVMe.": "Textures are read directly from the NVMe.",
    "Geometria infinita. Niente più LOD.": "Infinite geometry. No more LODs.",
    "Raytracing pathtraced completo.": "Full path-traced raytracing.",
    "Licenza d'uso": "End user license agreement",
    "Leggi attentamente i termini. Pixel Otros è software proprietario.": "Read the terms carefully. Pixel Otros is proprietary software.",
    "Ho letto, compreso e accetto di sacrificare le mie prestazioni per il realismo.": "I have read, understood, and agree to sacrifice my performance for realism.",
    "Scarica SDK (45 GB)": "Download SDK (45 GB)",
    "Inizializzazione...": "Initializing...",
    "Workstation richiesta": "Workstation required",
    "Installazione non supportata su architettura mobile.": "Installation not supported on mobile architecture.",

    // ── Login, Register, Reset, Verify ──────────────────────
    "Accesso": "System access",
    "E-mail": "E-mail",
    "Password": "Password",
    "Rimani connesso": "Stay connected",
    "Password dimenticata?": "Forgot password?",
    "Verifica credenziali": "Verify credentials",
    "Oppure": "Or",
    "Accedi con Google": "Sign in with Google",
    "Non possiedi un account Kripix?": "Don't have a Kripix account?",
    "Crea nuovo account": "Create new account",
    "Nuovo giocatore": "New player",
    "Inizializzazione protocollo cloud": "Cloud protocol initialization",
    "Email": "Operational email",
    "Nome utente (username)": "Username (username)",
    "PASSWORD (Min 8 car. + 1 Numero)": "PASSWORD (Min 8 char. + 1 Number)",
    "Conferma password": "Confirm password",
    "Crea account": "Create account",
    "Hai già un ID?": "Already have an ID?",
    "Ripristino chiave": "Key restoration",
    "Verifica del canale crittografato in corso...": "Verifying encrypted channel...",
    "Inserisci la tua email. Ti invieremo un link crittografato per resettare la password.": "Enter your operational email. We will send an encrypted link to reset your password.",
    "NUOVA PASSWORD (Min 8 car. + 1 Numero)": "NEW PASSWORD (Min 8 char. + 1 Number)",
    "Conferma nuova password": "Confirm new password",
    "Aggiorna credenziali": "Update credentials",
    "Benvenuto, giocatore": "Welcome, player",
    "Account Google verificata. Scegli il tuo nome utente per completare la registrazione.": "Google identity verified. Choose your username to complete recruitment.",
    "Completa registrazione": "Complete registration",
    "Verifica in corso": "Verification in progress",
    "Decrittazione del token...": "Decrypting token...",
    "Accedi al terminale": "Access terminal",

    // ── Profilo ─────────────────────────────────────────────
    "Il mio Profilo": "My Profile",
    "Livello 1": "Level 1",
    "Giocatore": "Player",
    "ID database": "Database ID",
    "Stato": "Status",
    "Attivo": "Active",
    "Giochi": "Games",
    "Data reg.": "Reg. Date",
    "Modifica dati & avatar": "Edit data & avatar",
    "Esperienza operativa": "Operational experience",
    "Medagliere & obiettivi": "Awards & objectives",
    "Recluta": "Recruit",
    "Detective": "Detective",
    "Beta tester": "Beta tester",
    "Gold member": "Gold member",
    "Rete operativa": "Operational network",
    "Cerca e invia": "Search and send",
    "Programma Pixel Otros": "Pixel Otros program",
    "Accesso al motore grafico sperimentale.": "Access to the experimental graphics engine.",
    "Scarica dev-kit": "Download dev-kit",
    "Log attività recenti": "Recent activity log",
    "[OGGI] Accesso al terminale effettuato.": "[TODAY] Terminal access granted.",
    "[SISTEMA] Acquisizione licenza \"Harrow\".": "[SYSTEM] \"Harrow\" license acquired.",
    "[SYSTEM] Profilo sincronizzato con il server centrale.": "[SYSTEM] Profile synchronized with central server.",
    "Scollega Discord": "Sever connection",
    "Rimuovi": "Remove",
    "Integrazione Discord": "Discord integration",
    "Sincronizza il tuo Dossier per ottenere i ruoli sul server.": "Sync your Dossier to get roles on the server.",
    "Collega account": "Link account",
    "Collegato come: ": "Connected as: ",
    "Attivo (online)": "Active (online)",
    "Reclutamento completato con successo.": "Recruitment completed successfully.",
    "Stai per rimuovere il giocatore": "You are about to remove the Player",
    "dalla tua rete.": "from your network.",
    "Questa azione è irreversibile.": "This action is irreversible.",
    "Accetta": "Accept",
    "Rifiuta": "Decline",
    "Annulla invio": "Cancel request",
    "In attesa di risposta": "Awaiting response",
    "Richiesta connessione": "Connection request",
    "Fotoreporter": "Photoreporter",
    // Chiave dedicata: "ACCEDI" nella navbar significa "LOGIN", qui è
    // il badge che apre il terminale. Due traduzioni, due chiavi.
    "profilo_badge_accedi": "Access",

    // ── Impostazioni ────────────────────────────────────────
    "Impostazioni": "Configuration",
    "Profilo": "Player profile",
    "Privacy & dati": "Privacy & data",
    "Documentazione": "Documentation",
    "Il tuo profilo": "Player identity",
    "Nome utente": "Username",
    "Modifica ID": "Edit ID",
    "Email registrata": "Registered email",
    "Aggiorna mail": "Update mail",
    "Avatar": "Visual ID (avatar)",
    "Codici di attivazione": "External licenses",
    "Attiva un codice": "Redeem game code",
    "Attiva una licenza acquistata presso fornitori di terze parti (Steam, Retail).": "Activate a license purchased from third-party vendors (Steam, Retail).",
    "Inserisci chiave": "Enter key",
    "Sicurezza": "Security",
    "Password": "Access code",
    "Modifica password": "Change password",
    "Verifica in due passaggi": "Two-step verification",
    "Aggiunge un secondo lucchetto all'account: oltre alla password serve un codice a 6 cifre generato dalla tua app di autenticazione, che cambia ogni 30 secondi.": "Adds a second lock to your account: on top of the password you need a 6-digit code from your authenticator app, refreshed every 30 seconds.",
    "Attiva protezione": "Turn on protection",
    "Disattiva": "Turn off",
    // "ATTIVA" / "NON ATTIVA" sono definite più sotto, nel blocco beta:
    // stessa parola, stesso significato, una sola voce per entrambi gli usi.
    "Non attiva": "Inactive",
    "Conferma la tua identità": "Confirm your identity",
    "Prima di aggiungere un secondo fattore dobbiamo essere sicuri che sia davvero tu.": "Before adding a second factor we need to be sure it is really you.",
    "Il tuo account usa l'accesso Google: si aprirà una finestra per confermare.": "Your account uses Google sign-in: a window will open for you to confirm.",
    "Prosegui": "Continue",
    "Collega l'app": "Connect the app",
    "Non puoi inquadrarlo? Inserisci la chiave a mano:": "Can't scan it? Enter the key manually:",
    "Ho collegato l'app": "The app is connected",
    "Inserisci il codice": "Enter the code",
    "Digita le 6 cifre che vedi nell'app. Cambiano ogni 30 secondi.": "Type the 6 digits shown in the app. They change every 30 seconds.",
    "Protezione attiva": "Protection active",
    "Da adesso, a ogni accesso ti verrà chiesto il codice a 6 cifre.": "From now on, every sign-in will ask for the 6-digit code.",
    "Tieni l'app installata e, se puoi, salva la chiave in un posto sicuro: perdere il telefono senza backup significa perdere l'accesso all'account.": "Keep the app installed and, if you can, store the key somewhere safe: losing your phone without a backup means losing access to the account.",
    "Ho capito": "Got IT",
    "Disattiva la protezione": "Turn off protection",
    "L'account tornerà protetto dalla sola password. Conferma la tua identità per procedere.": "The account will go back to password-only protection. Confirm your identity to continue.",
    "Inserisci il codice dell'app per confermare.": "Enter the code from your app to confirm.",
    "Apri la tua app di autenticazione e inserisci il codice a 6 cifre.": "Open your authenticator app and enter the 6-digit code.",
    "Zona pericolosa": "Red zone",
    "L'eliminazione è irreversibile.": "Deletion is irreversible.",
    "Elimina account": "Delete account",
    "Privacy": "Data & telemetry control",
    "Visibile nella ricerca": "Network visibility",
    "Permetti ad altri giocatori di trovarti tramite la barra di ricerca.": "Allow other players to find you via the search bar.",
    "Modalità invisibile": "Ghost mode",
    "Appari sempre offline a tutti.": "Always appear offline to the entire network.",
    "Dati sui crash": "Telemetry sharing",
    "Invia dati di crash e performance a Kripix.": "Send crash and performance data to Kripix.",
    "Email dallo studio": "Studio communications",
    "Ricevi aggiornamenti e inviti per le Beta via Email.": "Receive updates and Beta invites via Email.",
    "Documenti legali": "Legal archives",
    "Consulta le direttive operative e legali del Kripix.": "Consult the operational and legal directives of the Kripix.",
    "Gestione Cookie": "Cookie Management",
    "Aggiorna nome utente": "Update player ID",
    "Cambia email": "Update channel (email)",
    "Invia verifica": "Send verification",
    "Aggiorna password": "Update password",
    "Aggiorna": "Update",
    "Conferma eliminazione": "Confirm deletion",
    "Conferma": "Confirm",
    "Operazione riuscita": "Operation successful",
    "Dati aggiornati correttamente.": "Data updated successfully.",
    "Attiva un codice": "License activation",
    "Inserisci il codice a 16 o 20 cifre.": "Enter the 16 or 20 digit encrypted code.",
    "Attiva il codice": "Decrypt key",

    // ── Libreria ────────────────────────────────────────────
    "Archivio personale": "Personal archive",
    "Licenze attive e software assegnato.": "Active licenses and assigned software.",
    "Nessuna licenza trovata": "No license found",
    "Non hai ancora acquistato software Kripix.": "You haven't purchased Kripix software yet.",
    "Vai allo store": "Go to store",
    "Scelta piattaforma": "Platform selection",
    "Seleziona il sistema operativo per avviare il download.": "Select the operating system to start the download.",
    "● Licenza attiva": "● Active license",
    "Installa": "Install",
    "Acquisto completato": "Purchase completed",
    "Vai alla libreria": "Go to library",
    "Resta Qui": "Stay Here",
    "Scarica PDF": "Download PDF",
    "Visualizza Ricevuta": "View Receipt",
    "Copia Chiave": "Copy Key",

    // ── Admin ───────────────────────────────────────────────
    "Terminale staff": "Staff terminal",
    "Accesso di Livello 5. Autorizzazione concessa.": "Level 5 Access. Authorization granted.",
    "Giocatori registrati": "Registered players",
    "Licenze \"harrow\"": "\"Harrow\" licenses",
    "Chiavi vergini": "Blank keys",
    "Broadcast di rete": "Network broadcast",
    "Priorità: NORMALE": "Priority: NORMAL",
    "Priorità: ALTA": "Priority: HIGH",
    "Trasmetti su Kripix": "Broadcast to network",
    "Storico comunicazioni": "Communications history",
    "Verifica credenziali staff in corso...": "Verifying overseer credentials...",

    // ── 404 & Auth-Action ───────────────────────────────────
    "Dossier sconosciuto": "Unknown dossier",
    "Il percorso che stai cercando di seguire non esiste o è stato cancellato.": "The path you are trying to follow does not exist or has been deleted.",
    "Non c'è nulla da vedere qui, Giocatore.": "There's nothing to see here, Player.",
    "Analisi segnale crittografato in corso...": "Analyzing encrypted signal...",

    // ── Terminale ───────────────────────────────────────────
    "Conversazioni": "Encrypted channels",
    "Caricamento delle conversazioni…": "Syncing contacts...",
    "Scegli una conversazione": "Select an operative channel",
    "Giocatore Sconosciuto": "Unknown Player",
    "Stato Sconosciuto": "Unknown Status",
    "Scrivi un messaggio...": "Write an encrypted message...",
    "Invia": "Send",
    "[ PROTOCOLLO A SENSO UNICO ] Impossibile trasmettere al livello 5.": "[ ONE-WAY PROTOCOL ] Cannot transmit to level 5.",
    "Nessun contatto disponibile.": "No contacts available.",
    "Canale Diretto": "Direct Channel",
    "Online": "Online",
    "Offline": "Offline",
    "[ Inizio trasmissione secura ]": "[ Secure transmission start ]",
    "Consegnato": "Delivered",
    "Letto": "Read",
    "Adesso": "Now",

    // ── FAQ / Centro Assistenza ─────────────────────────────
    "Centro assistenza": "Help center",
    "Domande frequenti, guide rapide e istruzioni operative.": "FAQs, quick guides and operational instructions.",
    "Primi passi": "First steps",
    "Guide rapide": "Quick guides",
    "Archivio risposte": "Answer archive",
    "Domande frequenti": "Frequently asked questions",

    // Guide rapide
    "Creare un account": "Create an account",
    "Apri la pagina di registrazione e inserisci la tua email.": "Open the registration page and enter your email.",
    "Scegli un nome utente unico, senza spazi.": "Pick a unique username, with no spaces.",
    "Imposta una password di almeno 8 caratteri con un numero.": "Set a password of at least 8 characters including a number.",
    "Conferma il link di verifica che ricevi via email e accedi.": "Confirm the verification link you receive by email, then log in.",
    "Crea il tuo account Kripix": "Create your Kripix account",
    "Acquistare un gioco": "Buy a game",
    "Accedi con il tuo account Kripix: la licenza viene legata all'account.": "Sign in with your Kripix account: the license is tied to the account.",
    "Apri il catalogo e scegli l'edizione che preferisci.": "Open the catalog and choose the edition you prefer.",
    "Completa il pagamento sulla pagina protetta da Stripe.": "Complete the payment on the terminal secured by Stripe.",
    "Trovi subito gioco e chiave nella tua Libreria.": "Game and key appear in your Library right away.",
    "Vai al catalogo": "Go to the catalog",
    "Installare il launcher": "Install the launcher",
    "Vai alla pagina di download: il sistema operativo viene riconosciuto da solo.": "Go to the download page: your operating system is detected automatically.",
    "Scarica il file .exe su Windows oppure .dmg su macOS.": "Download the .exe on Windows or the .dmg on macOS.",
    "Avvia l'installazione e apri il Kripix Launcher.": "Run the installer and open the Kripix Launcher.",
    "Accedi con il tuo account Kripix: la libreria si sincronizza da sola.": "Sign in with your Kripix account: your library syncs on its own.",
    "Scarica il launcher": "Download the launcher",
    "Riscattare una chiave": "Redeem a key",
    "Apri le Impostazioni dal menu del tuo avatar.": "Open Settings from your avatar menu.",
    "Apri la sezione Codici di attivazione.": "Go to the External Licenses section.",
    "Premi Inserisci Chiave e digita il codice.": "Press Enter Key and type your code.",
    "Il gioco compare nella Libreria dopo la verifica.": "The game appears in your Library once verified.",
    "Apri le impostazioni": "Open settings",
    "Proteggere l'account": "Protect your account",
    "In Impostazioni apri la sezione Sicurezza.": "In Settings, open the Security section.",
    "Attiva la Verifica in Due Passaggi e conferma la password.": "Turn on Two-Step Verification and confirm your password.",
    "Inquadra il QR con la tua app di autenticazione.": "Scan the QR code with your authenticator app.",
    "Digita il codice a 6 cifre per completare l'attivazione.": "Type the 6-digit code to finish activation.",
    "Attiva la 2FA": "Turn on 2FA",
    "Recuperare l'accesso": "Recover your access",
    "Nella pagina di accesso premi Password dimenticata.": "On the login page press Forgot password.",
    "Inserisci l'email con cui ti sei registrato.": "Enter the email you registered with.",
    "Apri il link che ricevi, controllando anche lo Spam.": "Open the link you receive, checking your Spam folder too.",
    "Imposta la nuova password e rientra nel tuo account.": "Set the new password and get back on Kripix.",
    "Recupera la password": "Reset your password",

    // Ricerca e filtri
    "Cerca una risposta...": "Search for an answer...",
    "Tutte": "All",
    "Account": "Account",
    "Acquisti": "Purchases",
    "Launcher": "Launcher",
    "Tecnico": "Technical",
    "Nessun risultato nell'archivio": "No results in the archive",
    "Prova con parole diverse oppure scrivici: rispondiamo noi.": "Try different words, or just write to us: we answer personally.",
    "Non hai trovato la risposta?": "Didn't find your answer?",
    "Nessun problema: scrivici e ti rispondiamo direttamente.": "No problem: get in touch and we'll answer you directly.",
    "Chiedi su Discord": "Ask on Discord",
    "Scrivi allo studio": "Write to the studio",

    // Domande
    "Come creo un account Kripix?": "How do I create a Kripix account?",
    "Ho dimenticato la password, cosa faccio?": "I forgot my password, what now?",
    "Posso cambiare nome utente o email?": "Can I change my username or email?",
    "Non ricevo l'email di verifica.": "I'm not receiving the verification email.",
    "Come elimino definitivamente il mio account?": "How do I permanently delete my account?",
    "Come acquisto un gioco sul Kripix Store?": "How do I buy a game on the Kripix Store?",
    "Quali metodi di pagamento sono accettati?": "Which payment methods do you accept?",
    "Che differenza c'è tra comprare qui e su Steam?": "What's the difference between buying here and on Steam?",
    "Dove trovo la mia chiave e la ricevuta?": "Where do I find my key and receipt?",
    "Ho una chiave comprata altrove: come la attivo?": "I have a key bought elsewhere: how do I activate it?",
    "Posso chiedere un rimborso?": "Can I request a refund?",
    "Come installo il Kripix Launcher?": "How do I install the Kripix Launcher?",
    "Il sistema dice che l'app non è verificata.": "My system says the app is not verified.",
    "I miei salvataggi sono al sicuro?": "Are my saves safe?",
    "Il launcher è disponibile per Linux o mobile?": "Is the launcher available for Linux or mobile?",
    "Quali sono i requisiti di sistema?": "What are the system requirements?",
    "Quali dati raccogliete su di me?": "What data do you collect about me?",
    "Come contatto il supporto?": "How do I contact support?",
    "Come attivo la verifica in due passaggi?": "How do I turn on two-step verification?",
    "Ho perso il telefono con l'app di autenticazione.": "I lost the phone with my authenticator app.",

    // Risposte (contengono markup: vedi data-i18n-html)
    "faq_a_crea_account": "Go to <a href=\"register.html\">Create new account</a>, enter your email, pick a unique username (no spaces) and a password of at least 8 characters including a number. A verification email will arrive: until you confirm it, access stays locked.",
    "faq_a_crea_account_2": "You can also use <strong>Sign in with Google</strong>. Even then you will be asked to choose a username to complete recruitment: skip that step and the account stays incomplete, so you won't be able to get in.",
    "faq_a_password": "On the <a href=\"login.html\">login</a> page press <strong>Forgot password?</strong> and enter your email: you will receive a link to set a new one. If you don't see it within a few minutes, check your Spam or Promotions folder.",
    "faq_a_modifica_id": "Yes. Open <a href=\"impostazioni.html\">Settings</a> and go to <strong>Your profile</strong>. The username must be unique on Kripix and cannot contain spaces. If you change your email, a new verification is sent to the new address.",
    "faq_a_verifica_mail": "Check Spam and Promotions first: automated messages often end up there. If nothing arrives after a few minutes, try logging in again — the system resends the verification email automatically. If it still fails, write to us and we will activate it by hand.",
    "faq_a_elimina_account": "From <a href=\"impostazioni.html\">Settings</a> → <strong>Danger zone</strong> → Delete Account. Your current password will be requested as confirmation.",
    "faq_a_elimina_account_2": "The action cannot be undone: profile, purchased licenses, keys and contact network are all wiped. If you need your receipts, download them as PDF from the Library first.",
    "faq_a_acquisto": "Sign in with your Kripix account, open the <a href=\"progetti.html\">catalog</a>, pick a game and press <strong>Buy now</strong>. You will be taken to the payment terminal secured by Stripe.",
    "faq_a_acquisto_2": "Once the payment goes through, the license is assigned immediately: you will find it in your <a href=\"libreria.html\">Library</a> along with the activation key and the receipt.",
    "faq_a_pagamenti": "Payments run through Stripe and accept credit and debit cards, Apple Pay, Google Pay and PayPal. Displayed prices already include VAT. Your card details never pass through our servers.",
    "faq_a_store_vs_steam": "The price is the same, but on the Kripix Store you get the <strong>Deluxe Edition</strong> — digital artbook, dossier and extra filters — and the full revenue stays with the studio. Steam carries the standard edition.",
    "faq_a_chiave": "Both live in your <a href=\"libreria.html\">Library</a>, on the game card: the key icon copies the code to your clipboard, the document icon opens the receipt, which you can also download as a PDF.",
    "faq_a_riscatto": "Open <a href=\"impostazioni.html\">Settings</a> → <strong>External Licenses</strong> → Enter key. The format is <code>KRPX-XXXX-XXXX-XXXX</code>. After verification the game shows up in your Library: each key can be redeemed only once.",
    "faq_a_rimborso": "Write to <a href=\"mailto:info@kripix.com\">info@kripix.com</a> with your account email and the purchase date. We review every request within the limits of European law on the right of withdrawal for digital content: a key that has already been redeemed cannot be refunded.",
    "faq_a_installa_launcher": "From the <a href=\"download.html\">Download App</a> page: the site detects your system and highlights the right build. Grab the <code>.exe</code> on Windows or the <code>.dmg</code> on macOS, finish the install and open the launcher.",
    "faq_a_installa_launcher_2": "On first launch, sign in with the same Kripix account you use on the site: your library and licenses sync by themselves.",
    "faq_a_app_non_verificata": "This happens with software from independent studios until it gathers enough downloads. On Windows press <strong>More info → Run anyway</strong>; on macOS right-click the app and choose <strong>Open</strong>.",
    "faq_a_app_non_verificata_2": "Only download the launcher from the official page: we do not distribute the program through third-party sites.",
    "faq_a_salvataggi": "Yes. While you are online, progress is uploaded to the cloud and tied to your Kripix account, so you find it again on any computer. If you play offline the save stays local and syncs the next time you connect.",
    "faq_a_linux": "Not at the moment. The launcher runs on 64-bit Windows 10 and 11 and on macOS (Apple Silicon and Intel). There is no phone or tablet version: our games need a workstation.",
    "faq_a_requisiti": "Every game lists minimum and recommended requirements on its own page. The one hard rule is the <strong>NVMe SSD</strong>: the Pixel Otros engine streams textures straight off the drive, so on a mechanical hard disk the game will not run properly.",
    "faq_a_privacy": "Only what the account needs in order to work: email, username, licenses and contact list. Crash and performance telemetry is optional and can be switched off in <a href=\"impostazioni.html\">Settings</a> → Privacy &amp; Data. Full details are in the <a href=\"cookies.html\">Privacy policy</a>.",
    "faq_a_supporto": "The fastest channel is our <a href=\"https://discord.gg/FwwuYJ4Dn3\" target=\"_blank\" rel=\"noopener noreferrer\">Discord server</a>, where we usually reply the same day. Otherwise use the form on the <a href=\"contatti.html\">Contact</a> page or write to <a href=\"mailto:info@kripix.com\">info@kripix.com</a>.",
    "faq_a_2fa": "Open <a href=\"impostazioni.html#sicurezza\">Settings → Security</a> and press <strong>Turn on protection</strong>. Once you confirm your password we show you a QR code: scan it with your authenticator app (Google Authenticator, Authy, 1Password and Bitwarden all work) and type the 6-digit code it displays.",
    "faq_a_2fa_2": "From then on, every sign-in asks for the code as well as the password. The code changes every 30 seconds and is generated on your phone: we never send it by email or SMS.",
    "faq_a_2fa_perso": "If you saved the key we showed you during setup, enter it in a new authenticator app and it will start producing valid codes again.",
    "faq_a_2fa_perso_2": "Without that key it takes a manual check: write to <a href=\"mailto:info@kripix.com\">info@kripix.com</a> <strong>from the account's email address</strong>. We verify your identity before removing the second factor, so expect a few days.",

    // ── Accessi beta & Kripix AI ────────────────────────────
    "Accessi beta": "Beta access",
    "Programmi sperimentali riservati ai giocatori selezionati.": "Experimental programs reserved for selected players.",
    "Apri elenco": "Open list",
    "Funzioni in prova, aperte a pochi giocatori per volta.": "Features under test, opened to a few players at a time.",
    "Richiedi accesso": "Request access",
    "Attiva": "Active",
    "In attesa": "Pending",
    "Non accolta": "Declined",
    "Non richiesta": "Not requested",
    "Accesso concesso. La trovi già attiva dove è prevista.": "Access granted. It is already live wherever it applies.",
    "Richiesta inviata. Ti avvisiamo nei messaggi appena viene valutata.": "Request sent. We'll notify you in the Terminal as soon as it is reviewed.",
    "Questa richiesta non è stata accolta. Puoi riprovare più avanti.": "This request was not accepted. You can try again later.",
    "Candidature chiuse per questo programma.": "Applications are closed for this program.",
    "Assistente di supporto conversazionale": "Conversational support assistant",

    "Kripix AI": "Kripix AI",
    "Richiedi l'accesso": "Request access",
    "Un assistente che conosce il Network e ti accompagna nel problema. È in beta chiusa: accedi per vedere se hai l'accesso.": "An assistant that knows Kripix and walks you through the problem. It is in closed beta: sign in to see whether you have access.",
    "Un assistente che conosce il Network e ti accompagna nel problema. In questo momento è aperto a un gruppo ristretto di giocatori.": "An assistant that knows Kripix and walks you through the problem. Right now it is open to a small group of players.",
    "Hai accesso alla beta: trovi l'assistente nel pulsante in basso a destra, su qualsiasi pagina.": "You have beta access: the assistant lives in the button at the bottom right, on any page.",
    "La tua richiesta di accesso è in valutazione. Ti avvisiamo nei messaggi appena viene decisa.": "Your access request is under review. We'll notify you in the Terminal once it is decided.",

    // Widget fluttuante
    "Apri Kripix AI": "Open Kripix AI",
    "Chiudi Kripix AI": "Close Kripix AI",
    "Chiudi": "Close",
    "Messaggio": "Message",
    "Invia": "Send",
    "Scrivi il tuo problema...": "Describe your problem...",
    "Ho perso il telefono con l'app di autenticazione": "I lost the phone with my authenticator app",
    "Il launcher non parte": "The launcher won't start",
    "Non trovo la chiave del gioco": "I can't find my game key",

    // ── Cookie banner ───────────────────────────────────────
    "cookie_title": "Cookie initialization",
    "cookie_text": "The Kripix Operative Network uses essential tracking packets (Cookies) to keep the connection stable and save your preferences. We do not sell your data to corporates. <br><br>You can read the <a href=\"cookies.html\">Privacy policy</a> for full details.",
    "Accetta tutti": "Accept all",
    "Solo essenziali": "Essentials only",

    // ── Placeholder & Form ──────────────────────────────────
    "La tua email...": "Your email...",
    "••••••••": "••••••••",
    "nome@esempio.com": "name@example.com",
    "Scegli il tuo ID": "Choose your ID",
    "Crea password": "Create password",
    "Ripeti password": "Repeat password",
    "Nuova Password (Min 8 + Num)": "New Password (Min 8 + Num)",
    "Vecchia Password": "Old Password",
    "Conferma Nuova Password": "Confirm New Password",
    "Ricerca: Inserire Nome Giocatore...": "Search: Enter Player Name...",
    "Nuovo Username...": "New Username...",
    "La tua password attuale...": "Your current password...",
    "La nuova email...": "The new email...",
    "Password attuale": "Current password",
    "Titolo Comunicazione...": "Communication Title...",
    "Testo del messaggio...": "Message text...",
    "URL Destinazione (Opzionale)": "Destination URL (Optional)",
    "KRPX-XXXX-XXXX-XXXX": "KRPX-XXXX-XXXX-XXXX",
    "Nome utente Unico...": "Unique username...",
    "Inserisci nuova password": "Enter new password",

    // ── Messaggi dinamici JS & Notifiche ────────────────────
    "Verifica nel cloud...": "Verifying in cloud...",
    "Accesso consentito": "Access granted",
    "Errore cloud: email o password non valide": "Cloud error: invalid email or password",
    "AUTORIZZAZIONE IN SOSPESO. Ti abbiamo re-inviato una mail di verifica.": "AUTHORIZATION PENDING. We re-sent a verification email.",
    "Inserisci un'email valida.": "Enter a valid email.",
    "Invio in corso...": "Sending...",
    "PROTOCOLLO INVIATO. Controlla la casella email (anche nello Spam).": "PROTOCOL SENT. Check your email (including Spam).",
    "Inviato": "Sent",
    "ERRORE: Email non trovata o formato non valido.": "ERROR: Email not found or invalid format.",
    "Invia link": "Send link",
    "Elaborazione...": "Processing...",
    "Già nella libreria": "Already in library",
    "Errore transazione": "Transaction error",
    "FASE 1: Creazione dossier nel Cloud...": "PHASE 1: Creating dossier in Cloud...",
    "FASE 2: Connessione per l'invio mail...": "PHASE 2: Connecting for email dispatch...",
    "FASE 3: Trasmissione mail di sistema Firebase in corso...": "PHASE 3: Firebase system email transmission in progress...",
    "PROTOCOLLO COMPLETATO! Controlla la tua casella email (anche nello Spam).": "PROTOCOL COMPLETED! Check your email (including Spam).",
    "Registrazione completata": "Registration completed",
    "Le password non coincidono.": "Passwords do not match.",
    "La password è troppo corta.": "Password is too short.",
    "ATTENZIONE: Devi completare la registrazione scegliendo un nome utente.": "WARNING: You must complete registration by choosing a username.",
    "LICENZA ACQUISITA.\nIl download è stato aggiunto alla coda del tuo Kripix Launcher.": "LICENSE ACQUIRED.\nThe download has been added to your Kripix Launcher queue.",
    "ACCESSO NEGATO\n\nDevi identificarti come Developer registrato.": "ACCESS DENIED\n\nYou must identify yourself as a registered Developer.",
    "ERRORE: Il nome utente non può contenere spazi.": "ERROR: username cannot contain spaces.",
    "Questo ID è già in uso su Kripix.": "This ID is already in use on Kripix.",
    "Ripristino connessione": "Connection reset",
    "Torna al login": "Return to login",

    // ── Loading screen ──────────────────────────────────────
    "Caricamento…": "Connecting to network...",
    "Decrittazione dati...": "Decrypting data...",
    "Sincronizzazione...": "Synchronizing...",

    // ── Testi del nuovo sito (2026) ─────────────────────────
    "Giochi": "Games",
    "Studio": "Studio",
    "Launcher": "Launcher",
    "Assistenza": "Support",
    "Accedi": "Log in",
    "Profilo": "Profile",
    "I miei giochi": "My games",
    "Messaggi": "Messages",
    "Impostazioni": "Settings",
    "Pannello admin": "Admin panel",
    "Esci": "Log out",
    "Amministratore": "Administrator",
    "Giocatore": "Player",
    "Email": "Email",
    "Studio indipendente italiano. Facciamo giochi narrativi e horror per PC.": "Independent Italian studio. We make narrative and horror games for PC.",
    "Lo studio": "The studio",
    "Centro assistenza": "Help center",
    "Contatti": "Contact",
    "Legale": "Legal",
    "Termini d'uso": "Terms of use",
    "Privacy e cookie": "Privacy and cookies",
    "Politica DRM": "DRM policy",
    "Seguici": "Follow us",
    "Tutti i diritti riservati.": "All rights reserved.",
    "Sviluppato in Italia.": "Made in Italy.",
    "Cookie": "Cookies",
    "Accetta tutti": "Accept all",
    "Solo essenziali": "Essentials only",
    "cookie_text": "We use technical cookies to keep you signed in and remember your preferences. If you accept, we also record your browser, operating system and screen size, so we know which devices the site runs on. We don't sell your data. <a href=\"cookies.html\">Read the privacy policy</a>.",
    "Annulla": "Cancel",
    "Chiudi": "Close",
    "Conferma": "Confirm",
    "Il primo gioco di Kripix Entertainment": "The first game from Kripix Entertainment",
    "Un survival horror in cui la luce è la tua unica arma. Hai una vecchia macchina fotografica, e il suo flash è l'unica cosa che tiene lontani i mostri.": "A survival horror game where light is your only weapon. You have an old camera, and its flash is the only thing that keeps the monsters away.",
    "Scopri il gioco": "Discover the game",
    "Guarda il teaser": "Watch the teaser",
    "In arrivo su PC": "Coming to PC",
    "Notizie": "News",
    "Aggiornamenti in tempo reale su Discord": "Live updates on Discord",
    "Caricamento delle notizie…": "Loading news…",
    "Ancora nessuna notizia. Seguici su Discord per gli aggiornamenti.": "No news yet. Follow us on Discord for updates.",
    "Le notizie precedenti compariranno qui.": "Older news will show up here.",
    "Non riusciamo a caricare le notizie. Ricarica la pagina tra qualche minuto.": "We can't load the news right now. Reload the page in a few minutes.",
    "I nostri giochi": "Our games",
    "Tutti i giochi": "All games",
    "In sviluppo": "In development",
    "Stefano Valenti, giornalista, entra in un ristorante che cambia forma al buio. Ha solo una fotocamera degli anni '40 per uscirne vivo.": "Stefano Valenti, a journalist, walks into a restaurant that changes shape in the dark. All he has to get out alive is a camera from the 1940s.",
    "Scopri La Pagoda": "Discover La Pagoda",
    "In pre-produzione": "In pre-production",
    "Progetto senza nome": "Untitled project",
    "Un nuovo gioco nello stesso universo. Ne parleremo quando sarà pronto.": "A new game set in the same universe. We'll talk about it when it's ready.",
    "Pochi giochi. Fatti bene.": "Few games. Made well.",
    "Kripix Entertainment è uno studio indipendente italiano. Facciamo giochi narrativi in cui l'atmosfera conta quanto le meccaniche, e ogni scelta lascia un segno.": "Kripix Entertainment is an independent Italian studio. We make narrative games where atmosphere matters as much as mechanics, and every choice leaves a mark.",
    "Conosci lo studio": "Meet the studio",
    "L'atmosfera prima di tutto": "Atmosphere first",
    "Ogni ombra e ogni suono servono a rendere il mondo credibile.": "Every shadow and every sound is there to make the world believable.",
    "Meccaniche con un senso": "Mechanics that matter",
    "Quello che fai nel gioco ha conseguenze vere.": "What you do in the game has real consequences.",
    "Storie da scoprire": "Stories to uncover",
    "Non ti raccontiamo tutto: ti diamo gli strumenti per capirlo da solo.": "We don't tell you everything: we give you the tools to figure it out yourself.",
    "Qualità prima della quantità": "Quality over quantity",
    "Meglio dieci ore che ricordi che cento ore tutte uguali.": "Better ten hours you remember than a hundred hours that all feel the same.",
    "L'app gratuita per installare e aggiornare i nostri giochi.": "The free app to install and update our games.",
    "Aggiornamenti automatici": "Automatic updates",
    "Salvataggi nel cloud, su ogni computer": "Cloud saves, on any computer",
    "Contenuti extra per chi possiede il gioco": "Extra content for game owners",
    "Domande sul launcher": "Launcher questions",
    "Scarica": "Download",
    "Windows 10 e 11, 64 bit": "Windows 10 and 11, 64-bit",
    "Apple Silicon e Intel": "Apple Silicon and Intel",
    "Facciamo un gioco alla volta. Questo è quello a cui stiamo lavorando adesso.": "We make one game at a time. This is the one we're working on now.",
    "Un survival horror psicologico. La luce è la tua unica arma, e l'edificio cambia forma quando è buio.": "A psychological survival horror. Light is your only weapon, and the building changes shape in the dark.",
    "Edizione standard": "Standard edition",
    "Aggiungi alla wishlist": "Add to wishlist",
    "Stesso prezzo, più contenuti": "Same price, more content",
    "Include la Deluxe Edition": "Includes the Deluxe Edition",
    "Artbook, documenti del caso e filtri fotografici d'epoca.": "Artbook, case files and vintage photo filters.",
    "Ricevi una chiave Kripix. L'intero prezzo va allo studio.": "You get a Kripix key. The full price goes to the studio.",
    "Acquista": "Buy",
    "Già nei tuoi giochi": "Already in your games",
    "Survival horror. In arrivo su PC nel 2027.": "Survival horror. Coming to PC in 2027.",
    "La luce è la tua unica arma.": "Light is your only weapon.",
    "Il flash è la tua arma": "The flash is your weapon",
    "Non hai pistole. Hai una macchina fotografica degli anni '40.": "You have no guns. You have a camera from the 1940s.",
    "La Pagoda è un labirinto che cambia forma di continuo. Il flash della fotocamera blocca la realtà per un istante: rivela porte nascoste, sposta le pareti e ferma le creature che vivono lì dentro.": "La Pagoda is a maze that never stops changing shape. The camera flash freezes reality for an instant: it reveals hidden doors, moves walls and stops the creatures that live inside.",
    "Sei Stefano Valenti, giornalista di 42 anni, asmatico. Non sei un soldato: scappare è quasi sempre la scelta giusta. Accechi i mostri con il flash, li respingi a mani nude mentre sono storditi e ricarichi la fotocamera con le mani che tremano.": "You are Stefano Valenti, a 42-year-old journalist with asthma. You're not a soldier: running is almost always the right call. You blind the monsters with the flash, push them back with your bare hands while they're stunned, and reload the camera with shaking hands.",
    "Cosa ti aspetta": "What's waiting for you",
    "Quello che resta dell'Operazione Fornace.": "What's left of Operation Furnace.",
    "Il ristorante": "The restaurant",
    "Il nemico peggiore è l'edificio. Le stanze cambiano posto, i corridoi tornano su se stessi.": "The worst enemy is the building. Rooms move around, corridors loop back on themselves.",
    "Squadra Coyote": "Coyote Squad",
    "Ciò che resta degli agenti dell'FBI entrati prima di te. Fusi con l'arredamento, ti cercano al buio.": "What's left of the FBI agents who went in before you. Fused with the furniture, they hunt you in the dark.",
    "L'archivio": "The archive",
    "Fotografa le stanze vuote e sviluppa i rullini: compaiono i fantasmi della mafia che frequentava il locale nel 1960.": "Photograph the empty rooms and develop the film: the ghosts of the mobsters who frequented the place in 1960 appear.",
    "Il Maître": "The Maître",
    "Due metri, abito impeccabile, maschera da cervo. Non si ferma. Se ti prende è finita: scappa.": "Six and a half feet tall, a spotless suit, a deer mask. It doesn't stop. If it catches you, it's over: run.",
    "Requisiti di sistema": "System requirements",
    "Minimi": "Minimum",
    "Consigliati": "Recommended",
    "Sistema": "OS",
    "Processore": "Processor",
    "Memoria": "Memory",
    "Scheda video": "Graphics",
    "Spazio": "Storage",
    "85 GB su SSD NVMe (obbligatorio)": "85 GB on an NVMe SSD (required)",
    "85 GB su SSD NVMe Gen4": "85 GB on a Gen4 NVMe SSD",
    "Include il fascicolo «Insabbiamento Coyote» e i filtri fotografici d'epoca. Senza DRM.": "Includes the \"Coyote Cover-up\" case file and vintage photo filters. DRM-free.",
    "Siamo un piccolo studio italiano. Facciamo giochi narrativi, con calma, uno alla volta.": "We're a small Italian studio. We make narrative games, carefully, one at a time.",
    "Non facciamo passatempi. Facciamo mondi.": "We don't make pastimes. We make worlds.",
    "Per noi i videogiochi sono la forma d'arte più potente del nostro tempo. Vogliamo che chi gioca resti dentro le nostre storie anche dopo aver spento.": "To us, video games are the most powerful art form of our time. We want players to stay inside our stories even after they switch off.",
    "Il nostro primo gioco è La Pagoda. Lo sviluppiamo con Pixel Otros, il motore grafico che costruiamo in casa.": "Our first game is La Pagoda. We're building it with Pixel Otros, the engine we develop in-house.",
    "Come lavoriamo": "How we work",
    "Non è un contorno, è la base. Ogni ombra e ogni suono servono a rendere il mondo credibile.": "It's not decoration, it's the foundation. Every shadow and every sound is there to make the world believable.",
    "Niente meccaniche messe lì per riempire. Quello che fai nel gioco ha conseguenze vere.": "No filler mechanics. What you do in the game has real consequences.",
    "Non ti raccontiamo tutto: ti diamo gli strumenti per capire la storia da solo.": "We don't tell you everything: we give you the tools to understand the story yourself.",
    "Vuoi lavorare con noi?": "Want to work with us?",
    "Scrivici": "Write to us",
    "L'app gratuita per installare, aggiornare e avviare i nostri giochi.": "The free app to install, update and launch our games.",
    "Il tuo sistema": "Your system",
    "Scarica per Windows": "Download for Windows",
    "Scarica per macOS": "Download for macOS",
    "In arrivo": "Coming soon",
    "Il download è partito. Apri il file per installare il launcher.": "Your download has started. Open the file to install the launcher.",
    "Hai sempre l'ultima versione, senza fare niente.": "You always have the latest version, without lifting a finger.",
    "Salvataggi nel cloud": "Cloud saves",
    "Riprendi la partita da qualsiasi computer.": "Pick up your game on any computer.",
    "Contenuti extra": "Extra content",
    "Chi possiede un gioco riceve i bonus direttamente nel launcher.": "If you own a game, its bonuses arrive straight in the launcher.",
    "Solo staff": "Staff only",
    "Il nostro motore grafico. Qui trovi l'SDK e la licenza d'uso.": "Our game engine. Here you'll find the SDK and its license.",
    "Apri l'area sviluppatori": "Open the developer area",
    "Il motore grafico di Kripix. Da qui scarichi l'SDK (versione alpha).": "Kripix's game engine. Download the SDK (alpha) here.",
    "Collaborazioni, stampa, publishing o semplicemente un parere sui nostri giochi: leggiamo tutto.": "Partnerships, press, publishing or just your thoughts on our games: we read everything.",
    "Dove trovarci": "Where to find us",
    "Hai un problema con account o acquisti?": "Trouble with your account or a purchase?",
    "Le domande più comuni su account, acquisti, chiavi e launcher hanno già una risposta.": "The most common questions about accounts, purchases, keys and the launcher already have an answer.",
    "Vai al centro assistenza": "Go to the help center",
    "Nome": "Name",
    "Messaggio": "Message",
    "Invia messaggio": "Send message",
    "Come ti chiami": "Your name",
    "Scrivi qui la tua richiesta": "Write your request here",
    "Guide rapide e risposte alle domande più comuni.": "Quick guides and answers to the most common questions.",
    "Nessuna risposta trovata": "No answers found",
    "Bentornato. Entra con il tuo account Kripix.": "Welcome back. Log in with your Kripix account.",
    "Resta connesso": "Stay signed in",
    "oppure": "or",
    "Non hai ancora un account?": "Don't have an account yet?",
    "Creane uno": "Create one",
    "Invia il link": "Send the link",
    "Completa la registrazione": "Finish signing up",
    "Password dimenticata?": "Forgot your password?",
    "Crea un account": "Create an account",
    "Crea account": "Create account",
    "Ti serve per acquistare i giochi, usare il launcher e parlare con gli altri giocatori.": "You need one to buy games, use the launcher and chat with other players.",
    "Nome utente": "Username",
    "Password (almeno 8 caratteri e un numero)": "Password (at least 8 characters and a number)",
    "Ripeti la password": "Repeat the password",
    "Hai già un account?": "Already have an account?",
    "Nuova password": "New password",
    "Nuova password (almeno 8 caratteri e un numero)": "New password (at least 8 characters and a number)",
    "Salva la nuova password": "Save new password",
    "Conferma email": "Confirm email",
    "Verifica in due passaggi": "Two-step verification",
    "Il mio profilo": "My profile",
    "Stato": "Status",
    "Iscritto dal": "Member since",
    "Codice utente": "User code",
    "Modifica profilo": "Edit profile",
    "Livello": "Level",
    "Traguardi": "Achievements",
    "Benvenuto": "Welcome",
    "Fotoreporter": "Photojournalist",
    "Sostenitore": "Supporter",
    "Amici": "Friends",
    "Apri i messaggi": "Open messages",
    "Nome utente dell'amico": "Friend's username",
    "Invia richiesta": "Send request",
    "Programmi beta": "Beta programs",
    "Funzioni in prova, aperte a pochi giocatori alla volta.": "Features being tested, open to a few players at a time.",
    "Vedi i programmi": "See programs",
    "Il motore grafico dello studio, riservato allo staff.": "The studio's game engine, for staff only.",
    "Collega Discord per ricevere i ruoli sul nostro server.": "Link Discord to get your roles on our server.",
    "Collega Discord": "Link Discord",
    "Rimuovi amico": "Remove friend",
    "I giochi del tuo account, con le chiavi e le ricevute.": "The games on your account, with keys and receipts.",
    "Nessun gioco, per ora": "No games yet",
    "Quando acquisti un gioco o attivi un codice, lo trovi qui.": "When you buy a game or redeem a code, it shows up here.",
    "Scopri i giochi": "Browse games",
    "Scarica il launcher": "Download the launcher",
    "Scegli il tuo sistema operativo.": "Choose your operating system.",
    "Scarica PDF": "Download PDF",
    "Questa porta è chiusa": "This door is closed",
    "La pagina che cerchi non esiste, oppure è stata spostata.": "The page you're looking for doesn't exist, or it has moved.",
    "Torna alla home": "Back to home",
    "Il tuo profilo": "Your profile",
    "Email registrata": "Account email",
    "Aggiorna mail": "Change email",
    "Avatar": "Avatar",
    "Codici di attivazione": "Activation codes",
    "Attiva un codice": "Redeem a code",
    "Inserisci chiave": "Enter key",
    "Sicurezza": "Security",
    "Modifica password": "Change password",
    "Attiva protezione": "Turn on protection",
    "Disattiva": "Turn off",
    "Non attiva": "Off",
    "Attiva": "On",
    "Zona pericolosa": "Danger zone",
    "Elimina account": "Delete account",
    "Collegamenti esterni": "Linked accounts",
    "Discord": "Discord",
    "Scollega account": "Unlink account",
    "Privacy": "Privacy",
    "Visibile nella ricerca": "Visible in search",
    "Modalità invisibile": "Invisible mode",
    "Dati sui crash": "Crash data",
    "Email dallo studio": "Emails from the studio",
    "Documenti legali": "Legal documents",
    "Documentazione": "Documents",
    "Cambia email": "Change email",
    "Scollega Discord": "Unlink Discord",
    "Attiva il codice": "Redeem code",
    "Prosegui": "Continue",
    "Ho capito": "Got it"
};


// ── LINGUA ATTIVA ───────────────────────────────────────────

let currentDict = {};
let currentLang = 'it';


// ── FUNZIONE: Traduci un singolo nodo DOM ───────────────────

function translateNode(node) {
    if (!currentDict || Object.keys(currentDict).length === 0) return;

    // Nodo di testo puro
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue.trim();
        if (text && currentDict[text] && text !== currentDict[text]) {
            node.nodeValue = node.nodeValue.replace(text, currentDict[text]);
        }
        return;
    }

    // Nodo elemento
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.classList.contains('no-translate')) return;

    // 1) Attributo data-i18n (priorità massima)
    const i18nKey = node.getAttribute('data-i18n');
    if (i18nKey && currentDict[i18nKey]) {
        if (node.hasAttribute('data-i18n-html')) {
            // Traduzione che contiene markup (link, <strong>, <br>...).
            // I valori arrivano solo dal dizionario interno, mai dall'utente.
            node.innerHTML = currentDict[i18nKey];
            return;
        }
        if (node.children.length === 0) {
            node.textContent = currentDict[i18nKey];
        } else {
            // Conserva i figli, traduci solo il testo diretto
            node.childNodes.forEach(translateNode);
        }
    }

    // 2) Placeholder degli input
    if (node.hasAttribute('placeholder')) {
        const ph = node.getAttribute('placeholder').trim();
        if (currentDict[ph] && ph !== currentDict[ph]) {
            node.setAttribute('placeholder', currentDict[ph]);
        }
    }

    // 3) Attributo title
    if (node.hasAttribute('title')) {
        const t = node.getAttribute('title').trim();
        if (currentDict[t] && t !== currentDict[t]) {
            node.setAttribute('title', currentDict[t]);
        }
    }

    // 4) data-tooltip (usato nei badge profilo)
    if (node.hasAttribute('data-tooltip')) {
        const tt = node.getAttribute('data-tooltip').trim();
        if (currentDict[tt] && tt !== currentDict[tt]) {
            node.setAttribute('data-tooltip', currentDict[tt]);
        }
    }

    // 5) aria-label: è il testo che leggono gli screen reader,
    //    va tradotto come tutto il resto
    if (node.hasAttribute('aria-label')) {
        const al = node.getAttribute('aria-label').trim();
        if (currentDict[al] && al !== currentDict[al]) {
            node.setAttribute('aria-label', currentDict[al]);
        }
    }

    // Ricorsione sui figli
    node.childNodes.forEach(translateNode);
}


// ── FUNZIONE: Evidenzia lingua attiva nel selettore ─────────

function updateLanguageIndicator() {
    // Allinea anche l'attributo lang del documento: serve agli screen
    // reader per pronunciare i testi con la fonetica giusta.
    document.documentElement.lang = currentLang;

    document.querySelectorAll('.lang-switcher .lang-btn').forEach(btn => {
        const isCurrent = (btn.dataset.lang || btn.textContent.trim().toLowerCase()) === currentLang;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-pressed', String(isCurrent));
    });
}


// ── EXPORT: Inizializza il traduttore ───────────────────────

export function initTranslator() {
    currentLang = localStorage.getItem('kripix_lang') || 'it';

    if (currentLang === 'it') {
        currentDict = {};
        updateLanguageIndicator();
        return;
    }

    currentDict = currentLang === 'en' ? dizionario_EN : {};

    // Traduci tutto il body
    translateNode(document.body);

    // Evidenzia la lingua attiva
    updateLanguageIndicator();

    // MutationObserver per contenuto aggiunto dinamicamente (modali, notifiche, ecc.)
    const observer = new MutationObserver((mutations) => {
        observer.disconnect();
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => translateNode(node));
            }
            if (mutation.type === 'characterData') {
                const text = mutation.target.nodeValue.trim();
                if (text && currentDict[text] && text !== currentDict[text]) {
                    mutation.target.nodeValue = currentDict[text];
                }
            }
        });
        startObserver();
    });

    function startObserver() {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: false
        });
    }

    startObserver();
}


// ── EXPORT: Cambia lingua ───────────────────────────────────

export function switchLanguage(lang) {
    localStorage.setItem('kripix_lang', lang);

    // NOTA: le versioni inglesi separate delle pagine legali
    // (eula-eng.html, dmr-eng.html, privacy-eng.html) non esistono ancora.
    // Finché non ci sono, ricaricare la pagina è meglio di un 404.
    location.reload();
}


// ── EXPORT: Traduci una stringa a runtime (per uso JS) ──────

export function t(key) {
    if (currentLang === 'it' || !currentDict[key]) return key;
    return currentDict[key];
}
