import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDemoData } from "./utils/initDemoData";

// Initialize demo data on app start
initDemoData();

createRoot(document.getElementById("root")!).render(<App />);
