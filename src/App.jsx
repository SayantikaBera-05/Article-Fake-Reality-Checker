import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import VerificationPage from './pages/VerificationPage';
import VerificationResults from './pages/VerificationResults';
import UserDashboard from './pages/UserDashboard';
import AboutTruthLens from './pages/AboutTruthLens';
import SignIn from './pages/SignIn';

function App() {
  return (
    
    <Router>
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300">
        <TopNavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/results" element={<VerificationResults />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/about" element={<AboutTruthLens />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
