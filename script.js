const firebaseConfig = {
  apiKey: "AIzaSyBY13pZnUt0cobl3zEIMJ6yWPNrEB1FnMs",
  authDomain: "roomchat-35b78.firebaseapp.com",
  databaseURL:
    "https://roomchat-35b78-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roomchat-35b78",
  storageBucket: "roomchat-35b78.firebasestorage.app",
  messagingSenderId: "1045535811306",
  appId: "1:1045535811306:web:13dbb64839684fa3b6d993",
  measurementId: "G-DH0V11LGH1",
};

// Inisialisasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Fungsi Login
function login() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("Login berhasil");
      setUserOnlineStatus(true); // Set status online
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}

// Fungsi Daftar
function signUp() {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (password.length < 6) {
    alert("Password minimal 6 karakter!");
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Registrasi berhasil! Silakan login.");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}

// Fungsi Kirim Pesan
function sendMessage() {
  const message = document.getElementById("messageInput").value.trim();
  const user = auth.currentUser;

  if (!message) {
    alert("Pesan tidak boleh kosong!");
    return;
  }

  if (user) {
    const username = user.email.split("@")[0];
    database.ref("messages").push({
      user: username,
      text: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
    document.getElementById("messageInput").value = "";
  }
}

// Fungsi Logout
function logout() {
  setUserOnlineStatus(false); // Set status offline
  auth.signOut();
}

// Fungsi Set User Online/Offline
function setUserOnlineStatus(isOnline) {
  const user = auth.currentUser;
  if (user) {
    const username = user.email.split("@")[0];
    database.ref("users/" + username).set({
      online: isOnline,
      lastSeen: isOnline ? null : new Date().toISOString(),
    });
  }
}

// Dengar Pesan Real-Time dan Tampilkan
function listenMessages() {
  const chatArea = document.getElementById("messages");
  database
    .ref("messages")
    .orderByChild("timestamp")
    .on("child_added", (snapshot) => {
      const msg = snapshot.val();
      const div = document.createElement("div");
      div.className = `message ${
        msg.user === auth.currentUser.email.split("@")[0] ? "sent" : "received"
      }`;
      div.innerHTML = `
        <div class="user-name">${msg.user}</div>
        <div>${msg.text}</div>
      `;
      chatArea.appendChild(div);
      // Scroll otomatis ke pesan terbaru
      chatArea.scrollTop = chatArea.scrollHeight;
    });
}

// Fungsi Kirim Pesan dengan Enter
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Cek Status Login
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in:", user.email);
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("chatRoom").style.display = "block";
    listenMessages(); // <-- Pastikan ini dipanggil
  } else {
    console.log("User logged out");
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("chatRoom").style.display = "none";
  }
});
