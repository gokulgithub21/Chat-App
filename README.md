# 💬 Real-Time Chat Application

A full-stack **real-time chat application** built with **Angular (Frontend)** and **PHP + MySQL (Backend)**.  
It provides secure authentication, one-to-one and group messaging, **end-to-end encryption (E2EE)**, 
profile management, and a responsive UI for all devices.

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
- Angular
- TypeScript
- Socket.IO (WebSockets)

**Backend**
- PHP
- MySQL
- XAMPP (Server Environment)
- PHPMailer (for password reset via email)

---

## 📂 Project Structure

chat-app/
│── frontend/ # Angular project
│ ├── src/
│ ├── package.json
│ └── .gitignore
│
│── backend/ # PHP + MySQL
│ ├── angular-auth/
│ ├── forgot_password.php
│ ├── reset_password.php
│ └── chatapp.sql
│
│── screenshots/ # Project images
│── README.md

---

## ⚡ Installation & Setup

### 1️⃣ Frontend (Angular)
```bash
cd frontend
npm install
ng serve
  =>Runs at: http://localhost:4200/

2️⃣ Backend (PHP + MySQL)

Copy the backend/ folder into your XAMPP htdocs directory.

Install PHPMailer in your htdocs (for email password reset):
    =>composer require phpmailer/phpmailer

Start Apache & MySQL in XAMPP.

Open phpMyAdmin → import chatapp.sql.

3️⃣ Real-Time Messaging (Socket.IO)

Run the Node server:
node server.js  #socket.io
  =>Runs at: http://localhost:3000/


📸 Screenshots

## 📸 Screenshots

### 🔑 Authentication
- **Sign In**  
  ![Sign In](screenshots/sign_in.png)

- **Sign Up**  
  ![Sign Up](screenshots/sign_up.png)

- **Forgot Password**  
  ![Forgot Password](screenshots/forgot_password.png)

---

### 💬 Chat
- **Chat List**  
  ![Chat List](screenshots/chat_list.png)

- **One-to-One Chat**  
  ![Chat Message](screenshots/chat_msg.png)

---

### 👥 Groups
- **Group List**  
  ![Group List](screenshots/group_list.png)

- **Group Chat**  
  ![Group Chat](screenshots/group_msg.png)

- **Group Creation**  
  ![Group Creation](screenshots/group_creation.png)

- **View/Edit Group Details**  
  ![Group Details](screenshots/view_or_edit_group_details.png)

---

### 👤 Profile & Contacts
- **Profile Management**  
  ![Profile Management](screenshots/profile_management.png)

- **Add New Contact**  
  ![Add New Contact](screenshots/add_new_contact.png)



📜 License

This project is open-source. You can use it for learning and development purposes.

