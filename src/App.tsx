import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer"; // Import Footer
// Import page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
// TODO: Import other pages as they are created (EventsPage, EventDetailPage, etc.)
import "./App.css"; // Keep existing App specific styles

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-nord6 text-nord1">
        <Navbar />
        {/* Main content area takes full width with padding */}
        <main className="flex-grow px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            {/* TODO: Add routes for other pages */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
