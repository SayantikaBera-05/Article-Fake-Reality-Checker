import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HistoryPage } from './pages/HistoryPage';
import { DashboardPage } from './pages/DashboardPage';
import { VerifyPage } from './pages/VerifyPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SavedEvidencePage } from './pages/SavedEvidencePage';
import { SettingsPage } from './pages/SettingsPage';
import { OAuthSuccessPage } from './pages/OAuthSuccessPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { Footer } from './components';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      {/* AuthProvider wraps Router so auth state is available to all routes,
          including the OAuthSuccessPage which needs useAuth + useNavigate */}
      <AuthProvider>
        <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/saved-evidence" element={<SavedEvidencePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Password Reset */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />
              {/* Documentation */}
              <Route path="/docs" element={<DocumentationPage />} />
              {/* OAuth callback route — backend redirects here after Google sign-in */}
              <Route path="/oauth-success" element={<OAuthSuccessPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
