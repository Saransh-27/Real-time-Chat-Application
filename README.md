<div align="center">
  <h1>💬 Real-Time Chat Application</h1>
  <p>A full-stack, enterprise-grade real-time messaging platform built with Spring Boot and Next.js.</p>
  
  <p>
    <a href="https://chatapp-frontend-three-kohl.vercel.app"><b>🔥 View Live Demo</b></a>
  </p>
</div>

> ⚠️ **Important Note for Reviewers:** The Spring Boot backend is currently hosted on a free-tier Render instance. To save resources, the server naturally spins down during inactivity. When you first open the live demo, **please wait about 45 to 50 seconds** for the backend server to wake up. Thanks for your patience! 😉

---

## 🎥 Video Demonstration

> **Note for Recruiters:** A full video walk-through of the application's features and architecture will be embedded here soon!
*(Add your video link or GIF here later by replacing this text: `![App Demo](link_to_gif_or_video)`)*

---

## 🚀 Overview

This repository contains a fully functional, highly scalable real-time chat application. Designed with modern architectural patterns, it leverages the power of **Spring Boot** for a robust backend and **Next.js** for an ultra-fast, responsive frontend. 

Built to emulate premium messaging platforms, the application supports instant messaging through **WebSockets**, secure authentication, and seamless user profile management within a beautiful, pixel-perfect user interface.

## ✨ Key Features

- **⚡ Real-Time Messaging:** Lightning-fast, bi-directional communication using STOMP over WebSockets for zero-latency chats.
- **🔐 Secure Authentication:** Robust user registration and login system with token-based security and duplicate-user prevention.
- **🎨 Premium UI/UX:** Stunning, responsive interface built with TailwindCSS, featuring smooth micro-animations (Framer Motion) and a seamless **Dark/Light Mode** toggle.
- **👤 User Management:** Complete profile ecosystem allowing users to dynamically update their usernames, passwords, or delete their accounts safely.
- **🗄️ NoSQL Scalability:** Powered by MongoDB for flexible and highly scalable chat history and user data storage.
- **☁️ Cloud Deployed:** CI/CD deployment on Vercel for high global availability.

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **WebSocket Client:** SockJS & StompJS
- **Deployment:** Vercel

### Backend
- **Framework:** Java Spring Boot 3
- **Security:** Spring Security
- **Database:** MongoDB (Spring Data MongoDB)
- **Real-Time Engine:** Spring WebSocket API (STOMP)
- **API:** RESTful Architecture

---

## 🛠️ Getting Started (Local Development)

If you'd like to run this application locally on your machine, follow these steps:

### Prerequisites
- Java 17+ installed
- Node.js 20+ installed
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Setup
```bash
# Navigate to the backend directory (root)
cd ChatApp

# Run the Spring Boot application (Maven wrapper)
./mvnw spring-boot:run
```
*The backend will start on `http://localhost:8080`*

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend
cd chatapp-frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```
*The frontend will start on `http://localhost:3000`*

---

## 👨‍💻 About Me
I built this project to demonstrate my ability to architect and deliver complete, full-stack applications. It showcases my proficiency in integrating complex backend systems (Java/Spring Boot) with modern, dynamic frontend ecosystems (React/Next.js) resulting in production-ready software.

**Status:** Open to Work! Feel free to reach out if you're looking for a passionate Full-Stack Developer.
