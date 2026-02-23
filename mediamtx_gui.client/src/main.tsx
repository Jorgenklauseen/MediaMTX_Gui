import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.tsx";
import Recordings from "../src/pages/Recordings.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<App />} />
          <Route path="/recordings" element={<Recordings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
