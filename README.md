# Medi-Connect 🩺

## Overview

Medi-Connect is a sleek, fully responsive frontend prototype for a modern healthcare management platform. Designed specifically for small medical practices and clinics, this Single Page Application (SPA) bridges the gap between affordable software and a premium user experience.

Built as the initial phase of a broader full-stack initiative, this application currently runs entirely on client-side web technologies. It utilizes a sober, iOS-inspired "bento box" design system to handle role-based workflows for patients, doctors, and system administrators.

## Core Features

* **Role-Based Access Control (Prototype):** Seamlessly toggle between Patient, Doctor, and Admin views to test distinct user journeys.
* **Dynamic SPA Routing:** Built entirely with vanilla JavaScript to handle state and view switching without page reloads.
* **Mock API Integration:** Uses the Fetch API to dynamically inject data from a local JSON structure, simulating asynchronous backend communication.
* **Premium UI/UX:** Features a highly readable, iOS-inspired aesthetic with system fonts, soft layered shadows, and responsive CSS Grid layouts.

## Tech Stack

* **HTML5:** Semantic structure.
* **CSS3:** Custom variables, CSS Grid, Flexbox, and native animations (no external CSS frameworks).
* **Vanilla JavaScript (ES6+):** DOM manipulation, event handling, and data fetching.

## Getting Started

### Prerequisites

Because this project uses the native `fetch()` API to retrieve `data.json`, opening the `index.html` file directly in your browser via the file system (`file://`) will result in a CORS error. You must serve the files using a local web server.

### Installation & Running Locally

1. Clone the repository:
```bash
git clone https://github.com/your-username/medi-connect.git
cd medi-connect

```


2. Start a local development server. If you use VS Code, the **Live Server** extension is recommended. Alternatively, you can use Python or Node:
* **Python:** `python3 -m http.server 8000`
* **Node.js:** `npx serve .`


3. Open `http://localhost:8000` in your browser.

## Project Structure

```text
/medi-connect
│
├── index.html     # Main entry point and SPA container
├── styles.css     # UI styling and bento-grid layout system
├── app.js         # Core application logic and DOM manipulation
├── data.json      # Mock database for patients, schedules, and resources
└── README.md      # Project documentation

```

## Future Enhancements & Roadmap

While this prototype effectively maps out the user experience and interface architecture, it is strictly static. To evolve this into a production-ready application, the following enhancements are planned:

* **React.js Migration:** Transitioning the vanilla JavaScript DOM manipulation into a component-based architecture using React. This will make managing the complex UI states (like chat interfaces and dynamic calendars) much cleaner and more scalable.
* **Robust Backend API:** Replacing the static `data.json` file with a live Node.js and Express.js REST API to handle real asynchronous requests, business logic, and error handling.
* **Persistent Database:** Integrating MongoDB (MERN stack) to securely store patient records, appointment histories, and clinic analytics.
* **Real Authentication:** Swapping the mock "Login as..." buttons for a secure, JWT-based authentication system with encrypted passwords and strict role-based route protection.
* **Real-Time Features:** Upgrading the secure messaging portal to use WebSockets (e.g., Socket.io) for live doctor-patient communication without needing to refresh.
