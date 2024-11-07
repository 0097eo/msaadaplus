import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./components/NavBar";
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailVerificationPage from './pages/VerifyEmailPage';
import CharitiesPage from './pages/CharitiesPage';
import ProfilePage from './pages/ProfilePage';
import DonorsPage from './pages/DonationsPage';
import BeneficiariesPage from './pages/BeneficiariesPage';
import StoriesPage from './pages/StoriesPage';
import CharityApplications from './pages/Applications';
import ManageCharityPage from './pages/ManageCharities';
import MyDonationsPage from './pages/MyDonationsPage';
import RecurringDonationsPage from './pages/RecurrentDonations';


function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify" element={<EmailVerificationPage />} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/stories/create" element={<StoriesPage />} />
          <Route path="/applications" element={<CharityApplications />} />
          <Route path="/manage-charities" element={<ManageCharityPage />} />
          <Route path="/donations" element={<MyDonationsPage />} />
          <Route path="/auto-donate" element={<RecurringDonationsPage />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App
