# Student Management System (Clinix Edition)

This repository contains a dual-interface student management system:
1. **C CLI**: A menu-driven command-line interface for local management (located in `cpp/`).
2. **Next.js Web UI**: A professional full-stack web application for remote management.

## Features
- **Add Student**: Add new student records.
- **View All Students**: Display all stored student records.
- **Search Student**: Find a student by their ID.
- **Delete Student**: Remove a student record by their ID.
- **Data Persistence**: Records are saved in binary files (C) and local storage (Web).

## Full-Stack Side Note
Beyond being a simple menu-driven C project, this repository implements **Full-Stack** architecture:
- **Frontend**: Built with React (Next.js) and Tailwind CSS for a high-end, responsive user experience.
- **Backend**: Utilizes Next.js logic for handling state and persistent storage.
- **Database**: Supports local binary file persistence for the CLI and browser-based storage for the Web UI.
- **Cross-Platform**: Designed to provide consistent data management across different interfaces.

## How to Run (C)
1. Navigate to the cpp directory: `cd cpp`
2. Compile: `gcc student_management.c -o student_management`
3. Run: `./student_management`

## How to Run (Web)
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Access at: `http://localhost:3000`
