import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Routes
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import MemoryDetail from "./pages/MemoryDetail";
import AlbumPage from "./pages/AlbumPage";
import TimelinePage from "./pages/TimelinePage";
import NotFoundPage from "./pages/NotFoundPage";
import SharedMemory from "./pages/SharedMemory";

// Components
import Layout from "./components/layout/Layout";

function App() {
  const location = useLocation();

  // Update the page title based on the current route
  useEffect(() => {
    const pageTitle =
      "Memoirly - " +
      (location.pathname === "/" ? "Home" : location.pathname.replace("/", ""));

    document.title = pageTitle;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />

        {/* Public shared memory route */}
        <Route path="/shared/:id" element={<SharedMemory />} />

        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/memory/:id"
            element={
              <ProtectedRoute>
                <MemoryDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/albums/:id?"
            element={
              <ProtectedRoute>
                <AlbumPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <TimelinePage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
