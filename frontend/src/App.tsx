import type { MouseEvent } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import OurStructurePage from "./pages/OurStructurePage";
import DocumentsPage from "./pages/DocumentsPage";
import ContactsPage from "./pages/ContactsPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./ScrollToTop";
import ServicesPage from "./pages/ServicesPage";
import NotFoundPage from "./pages/NotFoundPage";

const SkipLink = () => {
  const handleSkip = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById("main-content");
    if (!main) return;
    main.focus();
    main.scrollIntoView({ block: "start" });
  };

  return (
    <a href="#main-content" className="skip-link" onClick={handleSkip}>
      Перейти до вмісту
    </a>
  );
};

const LayoutWithFooter = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <ScrollToTop />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const LayoutWithoutFooter = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SkipLink />
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col outline-none"
      >
        <ScrollToTop />
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<LayoutWithFooter />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id/:slug?" element={<NewsDetailPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/structure" element={<OurStructurePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<LayoutWithoutFooter />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
