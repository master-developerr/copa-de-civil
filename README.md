# Copa de Civil 🏆

Welcome to **Copa de Civil**! A real-time, beautifully designed football (soccer) tournament management application built with React, Vite, Tailwind CSS, and Convex.

## 🌟 Features

- **Real-time Sync**: Powered by Convex, all tournament data (matches, scores, timers) syncs perfectly across multiple devices and browser tabs in real-time.
- **Admin Dashboard**: A secure admin portal to create teams, register players, and manage match events (goals, cards, extra time, penalties).
- **Live Match Tracking**: Track ongoing matches with a live timer, live pulse indicator, and instant score updates.
- **Tournament Standings**: Auto-calculating league table sorting teams by points, goal difference, and goals scored.
- **Predictor Challenge**: Users can lock in their predictions for the final match score before Matchday 3 ends!

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Lucide React (Icons)
- **Backend & Database**: Convex (Real-time DB & Cloud Functions)
- **Routing**: React Router DOM

## 🛠️ Getting Started

To run this project locally, follow these steps:

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/master-developerr/copa-de-civil.git
   ```
2. Navigate into the project directory:
   ```bash
   cd copa-de-civil
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Start the Convex development server (in a new terminal):
   ```bash
   npx convex dev
   ```
2. Start the Vite frontend development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:8080` (or the port provided by Vite) in your browser.

## 🛡️ Admin Access
To access the admin dashboard, navigate to `/admin/login`. 
- **Secret Code**: *(Contact administrator for code)*

## 📝 License
This project is open-source and available under the MIT License.
