# 🌌 LuminaNest

> **A Product of ZenithSync**  
> A collaborative, gamified E-Learning Management System (LMS) built using the MERN stack. Features role-based dual dashboards, an automated rewards engine, and high-performance real-time analytics dashboards.

---

## 🚀 Overview

**LuminaNest** bridges the gap between traditional learning platforms and modern user engagement. Engineered by a two-person team under the **ZenithSync** engineering organization, the application isolates client-side experience logic from server-side core architecture.

The platform features a fluid, responsive frontend with a custom visual system, paired with custom-built backend logic designed to track student progress, calculate leaderboard positioning on the fly, and dynamically issue badges based on performance metrics.

---

## 🛠 Tech Stack

- **Frontend:** React.js, React Router v6, Context API, CSS3 (Modular Custom Variables)
- **Backend:** Node.js, Express.js, RESTful API Architecture
- **Database:** MongoDB, Mongoose ODM
- **Tools & Security:** JWT (JSON Web Tokens), BCrypt, Multer Middleware, Git/GitHub Organization Workflow

---

## 🤝 Project Contribution Breakdown

To maintain an industry-standard production workflow, development was divided down the middle into **Product & Logic Lead** and **Systems & Architecture Lead** domains.

| Feature / Domain | **Niveditha Balaji** (Frontend & Logic Lead) | **Karthikeyan D K** (Systems & Admin Lead) |
| --- | --- | --- |
| **System Core** | **Frontend Core:** App Routing, Global State Management (Context API), and Indexing. | **Backend Core:** Server setup, Database connection (Mongoose), and Auth Middleware. |
| **User Experience** | **Student UX:** Full Student Dashboard, Course Player UI, and Badge Unlock visuals. | **Instructor Tools:** Course Creation Studio, Content Management, and Instructor Dashboard. |
| **Data Engine** | **Competitive Logic:** Real-time Leaderboard aggregation and XP calculation logic. | **Database Design:** Architecting all NoSQL Schemas (Users, Courses, Progress). |
| **Branding** | **Visual Identity:** Modern Design System, Glassmorphic UI components, and modular CSS. | **Project Infrastructure:** Dependency management (package.json), Environment setup, and Security. |
| **Game Logic** | **Backend Logic:** Reward engine for Quiz scoring and automated Badge triggering. | **API Routing:** RESTful routing for Authentication and Course CRUD operations. |

---

## 📂 Architectural File Ownership

This project was a collaborative Full-Stack effort by:

| Developer | Contribution | Profile |
| :--- | :--- | :--- |
| **Niveditha Balaji** | Full-Stack Development (MERN), UI/UX Design, Gamification Logic | [🔗 GitHub](https://github.com/NIVEDITHABALAJI) |
| **Karthikeyan D K** | Full-Stack Development (MERN), API Architecture, Database Security | [🔗 GitHub](https://github.com/Karthikeyandk) |

*Both developers contributed equally to the Frontend (React), Backend (Node/Express), and Database Design (MongoDB).*


---

## 🔧 Installation & Local Setup

### Prerequisites

- Node.js (v16.x or higher)
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/ZenithSync/LuminaNest.git
cd LuminaNest
```

### 2. Backend Configuration

Navigate to the backend directory, install the server dependencies, and configure environment paths:

```bash
cd backend
npm install
```

Create a `.env` file in the root of your `backend/` directory and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_secret_key
```

Start the local API development server:

```bash
npm run dev
# Or 'node server.js' depending on your package configuration
```

### 3. Frontend Configuration

Open a secondary terminal workspace, navigate to the frontend folder, install dependencies, and spin up the client build:

```bash
cd frontend
npm install
npm start
```

The application will launch on `http://localhost:3000` automatically.

---

## 🎯 Key Architectural Milestones

> [!NOTE]
> **Deployment Status:** Cloud deployment pipelines are currently being provisioned. The live production instance urls for the student app and instructor console are coming soon.

- **Role-Based Access Control (RBAC):** Restricts interface accessibility natively on the client using React state context while enforcing API protection at the backend routing level using JWT evaluation layers.
- **Advanced MongoDB Aggregation:** Optimizes database pipeline calls for the competitive leaderboard workspace, transforming tabular student telemetry into sorted, active ranking matrices efficiently.
- **Dynamic Document Viewers:** Implements client interface evaluation scripts allowing the same player module to smoothly switch visual frames depending on incoming MIME media types (MP4, PDF, or YouTube endpoints).
