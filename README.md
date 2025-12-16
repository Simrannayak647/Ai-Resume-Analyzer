# 📊 AI Resume Analyzer 

> A clean, practical, end‑to‑end web application that analyzes resume content, extracts meaningful insights, and presents them through an intuitive dashboard. Built with modern web technologies, optimized for clarity, performance, and real‑world usability.

---

## 🚀 Project Overview

This project helps users upload resume data and instantly view structured insights such as:

* Skill counts
* Technical vs non‑technical skill distribution
* Keyword frequency
* Overall content analysis

The system focuses on **frontend clarity + backend robustness**, avoiding unnecessary complexity. The earlier PDF parsing approach was intentionally removed to keep the architecture reliable and beginner‑friendly.

---

## 🧠 Key Features

* 📁 Resume upload (PDF / DOCX / TXT)
* 🧠 AI-powered resume understanding using **Gemini AI API**
* 📊 ATS score calculation
* 🧩 Skills extraction & categorization (technical / non-technical)
* 💪 Strengths & ⚠️ areas of improvement detection
* 💡 Actionable, role-based suggestions
* 📈 Clean dashboard with tab-wise insights
* 🎥 Screen-recorded demo support

---

## 🤖 Gemini AI API – How It’s Used

This project leverages **Google Gemini AI** as the core intelligence layer.

### What Gemini Does Here

* Parses resume content contextually (not just keyword matching)
* Identifies:

  * Skills
  * Strengths
  * Weaknesses
  * ATS relevance
* Generates structured insights in a format usable by the frontend

### Why Gemini (Real Reason)

* More reliable than rule-based parsing
* Better contextual understanding than traditional NLP
* Industry-grade AI suitable for real ATS-style analysis

### Backend Flow (High Level)

```text
Resume Upload → Text Extraction → Gemini Prompt → Structured JSON → Frontend UI
```

---

## 🛠️ Tech Stack

### Frontend

* **React.js** – Component‑based UI
* **Tailwind CSS** – Clean, responsive styling
* **Lucide Icons** – Lightweight icon set
* **Recharts** – Data visualization (charts & graphs)

### Backend

* **Node.js** – Runtime environment
* **Express.js** – REST API framework
* **Multer** – File handling (non‑PDF)
* **Gemini API** – Text analysis & AI insights

### Tools & Utilities

* **Postman** – API testing
* **VS Code** – Development environment
* **Git & GitHub** – Version control

---

### 📸 Screenshots

https://drive.google.com/file/d/1JjCdF4Nag7_zp1qdCC7_lM8PPzbhsteH/view?usp=sharing


---

## 🎥 Project Demo Video

▶️ **Watch the full working demo here:**

https://drive.google.com/file/d/1vme3lILkBWEvSbThg2eZr7wuUFKlGgzQ/view?usp=sharing

## ⚙️ How to Run the Project

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---
## 🧪 API Highlights

* `POST /analyze` – Sends resume text and returns analyzed insights
* `GET /stats` – Returns computed skill statistics
---


**Built with discipline, curiosity, and zero fluff.**
