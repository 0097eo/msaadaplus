import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext.jsx';

const NavItem = ({ to, children, setIsOpen }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block py-2 px-4 ${
        isActive ? 'text-black font-bold' : 'text-gray-100 hover:text-gray-800'
      } transition-colors duration-200`
    }
    onClick={() => setIsOpen(false)}
  >
    {children}
  </NavLink>
);

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

// Logo component
const Logo = () => (
  <div className="flex items-center">
    <span className="font-bold text-xl">
      <span className="text-pink-400">Msaada</span>
      <span className="text-white">Plus</span>
    </span>
    <Plus className="text-pink-400 w-6 h-6 mr-2" strokeWidth={2.75} />
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsOpen(false);
    }
  };

  const getNavLinks = () => {
    switch (user?.userType) {
      case 'donor':
        return [
          { to: '/charities', label: 'Charities' },
          { to: '/donations', label: 'My Donations' },
          { to: '/auto-donate', label: 'Auto-Donate' }
        ];
      case 'charity':
        return [
          { to: '/donors', label: 'Donors' },
          { to: '/stories/create', label: 'Stories' },
          { to: '/beneficiaries', label: 'Beneficiaries' }
        ];
      case 'admin':
        return [
          { to: '/applications', label: 'Applications' },
          { to: '/manage-charities', label: 'Manage Charities' },
        ];
      default:
        return [
          { to: '/', label: 'Home' },
          { to: '/about', label: 'About' }
        ];
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-pink-600 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="hover:opacity-80 transition-opacity duration-200">
              <Logo />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {getNavLinks().map((link) => (
              <NavItem key={link.to} to={link.to} setIsOpen={setIsOpen}>
                {link.label}
              </NavItem>
            ))}
            
            {/* Auth */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {user?.userType !== 'admin' && (
                    <NavItem to="/profile" setIsOpen={setIsOpen}>
                      Profile
                    </NavItem>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-gray-800 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <NavLink to="/signup">
                    <button className="bg-white hover:bg-pink-800 px-4 py-2 rounded-full text-black font-medium transition-colors duration-200">
                      Signup
                    </button>
                  </NavLink>
                  <NavLink to="/login">
                    <button className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full text-white font-medium transition-colors duration-200">
                      Login
                    </button>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-pink-400 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {getNavLinks().map((link) => (
              <NavItem key={link.to} to={link.to} setIsOpen={setIsOpen}>
                {link.label}
              </NavItem>
            ))}
            
            {isAuthenticated ? (
              <>
                {/* Profile Link for Mobile */}
                {user?.userType !== 'admin' && (
                  <NavItem to="/profile" setIsOpen={setIsOpen}>
                    Profile
                  </NavItem>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full text-white font-medium transition-colors duration-200 mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="block w-full" onClick={() => setIsOpen(false)}>
                <button className="w-full bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full text-white font-medium transition-colors duration-200">
                  Login
                </button>
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
