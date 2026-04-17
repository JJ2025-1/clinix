# Clinix: Clinic Management System

Clinix is a professional management system designed for clinicians to maintain patient records and visit history through both a command-line interface and a modern web dashboard.

## Features
- **Register Patient**: Create secure profiles for new patients with unique UIDs.
- **Visit Records**: Track clinical impressions and pharmacotherapy directives.
- **Search History**: Instant access to a patient's entire medical history.
- **Reporting**: Identify frequent visitors and station throughput.
- **Data Persistence**: Local binary storage (CLI) and localized web storage.

## Full-Stack Side Note
Beyond its menu-driven C implementation, Clinix is a **Full-Stack** solution:
- **Frontend**: A high-end React dashboard built with Next.js and Tailwind CSS, featuring a triage queue and EMR station.
- **Backend**: Integrated business logic for handling real-time clinic operations and state management.
- **EMR Integration**: Digital signature workflows for finalizing visit records and generating printable EMR statements.
- **Cross-Platform**: Seamlessly manage records via the terminal or the clinician portal.

## How to Run (C)
1. Navigate to the cpp directory: `cd cpp`
2. Compile: `gcc clinic_management.c -o clinic_management`
3. Run: `./clinic_management`

## How to Run (Web)
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Access at: `http://localhost:3000`
