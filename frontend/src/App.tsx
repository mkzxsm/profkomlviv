import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
<<<<<<< HEAD
import OurStructurePage from './pages/OurStructurePage';
=======
import ProfPage from './pages/ProfPage';
>>>>>>> upstream/main
import DocumentsPage from './pages/DocumentsPage';
import ContactsPage from './pages/ContactsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
<<<<<<< HEAD
import Services from './components/Services';
=======
>>>>>>> upstream/main
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from "./ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id/:slug?" element={<NewsDetailPage />} />
<<<<<<< HEAD
              <Route path="/Services" element={<Services />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/structure" element={<OurStructurePage />} />
=======
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/fuck" element={<ProfPage />} />
>>>>>>> upstream/main
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;