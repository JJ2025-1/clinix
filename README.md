# 🩺 Clinix: Advanced Clinic Management & Dual Patient-Clinician Portal

**Clinix** is a state-of-the-art, full-stack clinic management system and electronic medical records (EMR) platform built with Next.js, React, and Tailwind CSS. It features a dual-role portal supporting both **Clinicians** and **Patients**, real-time triage queue tracking, digital pharmacotherapy prescriptions, and printable EMR statements.

---

## 🌟 Key Features

### 👨‍⚕️ Clinician Workspace Portal
- **Active Station Console**: Initiate and finalize live consultations with active patient queue synchronization.
- **Electronic Triage List**: Real-time queue management, live patient tracking, and "No Show" list restoration.
- **Record Initiation & Search**: Register new patient profiles with auto-assigned UIDs and search full medical histories.
- **EMR Finalization & Digital Signature**: Record clinical impressions and pharmacotherapy directives with automatic billing generation.
- **Printable EMR Statements**: Generate official formatted printable diagnostic & prescription statements.
- **Analytics & Reports**: Track monthly EMR throughput metrics and frequent patient cohort statistics.

### 👤 Patient Self-Service Portal
- **Dual-Role Login**: Log in seamlessly using a **Patient UID** (e.g. `P101`) or registered mobile phone number.
- **Live Queue Ticket Tracker**: Real-time consultation queue position, estimated wait times, and live "In Consultation" status alerts.
- **Queue Participation**: Join or leave today's consultation queue with a single click.
- **Digital Health Records & Prescriptions**: View past diagnosis records, dosage directives, and print official EMR statements.
- **Patient Health Pass**: Digital identity pass displaying age, UID, emergency contact, and clinic hotline details.

---

## 🛠️ Technology Stack

- **Frontend & App Architecture**: [Next.js](https://nextjs.org/) (App Router), React 19, Tailwind CSS
- **Design & UI Icons**: Lucide React icons, modern light mode theme, glassmorphism, responsive mobile layouts
- **Logic & State**: Object-oriented `HospitalSystem` architecture with local storage persistence and demo data seeding
- **CLI Implementation**: Menu-driven C application (`cpp/clinic_management.c`)

---

## 🚀 Getting Started

### Web Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

### Command Line (C Version)

1. Navigate to the C source directory:
   ```bash
   cd cpp
   ```
2. Compile:
   ```bash
   gcc clinic_management.c -o clinic_management
   ```
3. Execute:
   ```bash
   ./clinic_management
   ```
