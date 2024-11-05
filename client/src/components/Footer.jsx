import { Link } from 'react-router-dom';
import { Plus, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ChevronRight} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Find Charities', path: '/charities' },
    { name: 'Impact Stories', path: '/stories' },
    { name: 'FAQs', path: '/faqs' }
  ];

  const charityResources = [
    { name: 'Apply as Charity', path: '/signup' },
    { name: 'Charity Dashboard', path: '/charity/dashboard' },
    { name: 'Success Stories', path: '/charities' },
    { name: 'Resource Center', path: '/about' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="font-bold text-xl">
                <span className="text-pink-600">Msaada</span>
                <span className="text-gray-800">Plus</span>
              </span>
              <Plus className="text-pink-600 w-6 h-6 mr-2" strokeWidth={3} />
            </div>
            <p className="text-gray-600">
              Empowering girls through education by providing essential sanitary supplies and facilities.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3" />
                <span>contact@msaadaplus.org</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3" />
                <span>+254 700 000000</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Charity Resources */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4">For Charities</h3>
            <ul className="space-y-3">
              {charityResources.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for impact stories and updates.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition duration-200"
              >
                Subscribe
              </button>
            </form>

            {/* Social Links */}
            <div className="mt-6">
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} MsaadaPlus. All rights reserved.
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;