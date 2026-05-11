import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import ComponentsPage from "./pages/ComponentsPage";
import ComponentDetailPage from "./pages/ComponentDetailPage";
import BuildsPage from "./pages/BuildsPage";
import BuildDetailPage from "./pages/BuildDetailPage";
import PrebuildsPage from "./pages/PrebuildsPage";
import PeripheryPage from "./pages/PeripheryPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/components/:id" element={<ComponentDetailPage />} />
          <Route path="/periphery" element={<PeripheryPage />} />
          <Route path="/prebuilds" element={<PrebuildsPage />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/builds/:id" element={<BuildDetailPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
