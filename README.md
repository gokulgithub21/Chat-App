# 💬 Real-Time Chat Application

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

A full-stack **real-time chat application** built with **Angular (Frontend)** and **PHP + MySQL (Backend)**.  
It provides secure authentication, one-to-one and group messaging, **end-to-end encryption (E2EE)**, profile management, and a responsive UI for all devices.

![Typing Animation](https://readme-typing-svg.herokuapp.com?size=24&color=F70A8D&width=500&lines=Real-time+Messaging+💬;Secure+Authentication+🔐;Media+Sharing+📂)

---

## 🚀 Features
- 🔐 **Authentication** – Signup, Login, Forgot/Reset Password
- 💬 **One-to-One Chat** – Private real-time messaging
- 👥 **Group Chat** – Create, join, and manage groups (with admin/member roles)
- 👤 **Profile Management** – Update profile details & profile picture
- 📜 **Chat History** – Persistent message history
- 📂 **Media Sharing** – Send images, documents, videos
- 🔍 **Search** – Find users and groups quickly
- 🔒 **End-to-End Encryption** – Messages are securely encrypted to protect user privacy
- 📱 **Responsive UI** – Works on desktop, tablet, and mobile

---

## 🛠 Tech Stack
**Frontend**
- Angular 18.2.10
- TypeScript
- Socket.IO (WebSockets)

**Backend**
- PHP
- MySQL
- XAMPP (Server Environment)
- PHPMailer (for password reset via email)

**Node.js**
- Latest version recommended

---

## 📂 Project Structure

```
chat-app/
├── frontend/                 # Angular project
│   ├── src/                  # Angular source files
│   ├── package.json          # Node dependencies
│   └── .gitignore
├── backend/                  # PHP + MySQL backend
│   ├── angular-auth/         # Authentication related PHP files
│   ├── forgot_password.php   # Password reset request
│   ├── reset_password.php    # Reset password logic
│   └── chatapp.sql           # Database schema
├── server.js                 # Node.js Socket.IO server
├── screenshots/              # Project screenshots
└── README.md                 # Project documentation
```

---

## ⚡ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/real-time-chat-app.git
cd real-time-chat-app
```

### 2️⃣ Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```
➡️ Runs at: **http://localhost:4200/**

> ⚠️ Make sure Angular version **18.2.10** is installed.  
> ⚠️ Use the latest Node.js version, otherwise it may not work.

---

### 3️⃣ Backend (PHP + MySQL)
1. Copy the `backend/` folder into your **XAMPP htdocs** directory.  
2. Install **PHPMailer** in htdocs for password reset:  
   ```bash
   composer require phpmailer/phpmailer
   ```
3. Start **Apache** & **MySQL** in XAMPP.  
4. Open **phpMyAdmin** → import `chatapp.sql`.

---

### 4️⃣ Real-Time Messaging (Socket.IO)
Run the Node server:
```bash
node server.js
```
➡️ Runs at: **http://localhost:3000/**

---

## 📸 Screenshots

### 🔑 Authentication
![Sign In](screenshots/sign_in.png)
![Sign Up](screenshots/sign_up.png)
![Forgot Password](screenshots/forgot_password.png)

### 📇 Contacts
![Add New Contact](screenshots/add_new_contact.png)

### 💬 Chat
![Chat List](screenshots/chat_list.png)
![One-to-One Chat](screenshots/chat_msg.png)

### 👥 Groups
![Group List](screenshots/group_list.png)
![Group Chat](screenshots/group_msg.png)
![Group Creation](screenshots/group_creation.png)
![View/Edit Group Details](screenshots/view_or_edit_group_details.png)

### 👤 Profile
![Profile Management](screenshots/profile_management.png)

---

## 📜 License
This project is open-source. You can use it for learning and development purposes.
