import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
    createRoot(document.getElementById("root")!).render(
        <div style={{ padding: "2rem", color: "white", textAlign: "center", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#ef4444", marginBottom: "1rem" }}>Configuration Error</h1>
            <p>The <code>VITE_CONVEX_URL</code> environment variable is not defined.</p>
            <p>If you have deployed this project to Vercel, please go to your Project Settings &gt; Environment Variables, add <code>VITE_CONVEX_URL</code> with your production Convex URL, and trigger a new deployment.</p>
        </div>
    );
} else {
    const convex = new ConvexReactClient(convexUrl);
    createRoot(document.getElementById("root")!).render(
        <ConvexProvider client={convex}>
            <App />
        </ConvexProvider>
    );
}
