import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Calendar, Sparkles, ArrowRight, Globe, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import empowerHer from '../assets/empowerher.jpg';
import girlsDignity from '../assets/girlsdignity.jpg';
import padsForTomorrow from '../assets/padsfortomorrow.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('auth_user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const stats = [
    { number: '20%', label: 'School days missed' },
    { number: '24', label: 'Weeks of learning lost' },
    { number: '1000+', label: 'Girls supported' },
    { number: '50+', label: 'Schools Reached' }
  ];

  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      title: 'Automated Donations',
      description: 'Set up recurring monthly donations to support girls consistently'
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: 'Direct Impact',
      description: 'Track how your donations are helping girls stay in school'
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      title: 'Multiple Charities',
      description: 'Choose from verified organizations making real change'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      title: 'Secure Platform',
      description: 'Safe and transparent donation process'
    }
  ];

  const featuredCharities = [
    {
      id: 1,
      name: "Girls Dignity Initiative",
      location: "Kenya",
      impact: "25,000+ girls supported",
      description: "Providing menstrual supplies and education to girls in rural Kenya, helping them stay in school with dignity.",
      monthlyGoal: "15,000",
      monthlyDonors: 234,
      image: girlsDignity,
      tags: ["Education", "Health", "Sanitation"]
    },
    {
      id: 2,
      name: "Pads for Tomorrow",
      location: "Uganda",
      impact: "15,000+ beneficiaries",
      description: "Building sustainable menstrual health programs and improving school sanitation facilities.",
      monthlyGoal: "12,000",
      monthlyDonors: 189,
      image: padsForTomorrow,
      tags: ["Health", "Infrastructure"]
    },
    {
      id: 3,
      name: "EmpowerHer Foundation",
      location: "Tanzania",
      impact: "10,000+ girls reached",
      description: "Combining menstrual health support with leadership training and educational resources.",
      monthlyGoal: "10,000",
      monthlyDonors: 156,
      image: empowerHer,
      tags: ["Education", "Leadership"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-700 to-pink-600 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Empowering Girls Through Education
              </h1>
              <p className="text-lg mb-8 text-purple-100">
                Join us in ensuring every girl has access to education by providing essential sanitary supplies and facilities. Your regular donations can help keep girls in school.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated && ( 
                  <button 
                    onClick={() => navigate('/signup')}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center transition duration-300"
                  >
                    Join Us
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => navigate('/about')}
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 text-white px-8 py-3 rounded-full font-semibold transition duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                    <div className="text-purple-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
            How You Can Make a Difference
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Real Impact, Real Stories
              </h2>
              <p className="text-gray-600 mb-6">
                Every donation helps keep a girl in school, giving her the chance for a better future. Our automated donation platform ensures consistent support, making a lasting difference in communities across sub-Saharan Africa.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-500 w-5 h-5" />
                  <span className="text-gray-700">Transparent tracking of your impact</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="text-purple-500 w-5 h-5" />
                  <span className="text-gray-700">Regular updates from beneficiaries</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-purple-500 w-5 h-5" />
                  <span className="text-gray-700">Community-driven initiatives</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-purple-100 p-8 rounded-2xl">
                <blockquote className="text-gray-700 italic mb-4">
                ’’Thanks to the regular donations, we’ve been able to provide sanitary supplies to over 1,000 girls in our district, reducing school dropout rates by 60%.’’
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-800">Sarah Ngugi</div>
                    <div className="text-gray-600">Local Program Coordinator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Charities Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Featured Charities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These verified organizations are making significant impacts in menstrual health and education. 
              Choose a charity to start your monthly donation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCharities.map((charity) => (
              <div key={charity.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                <img 
                  src={charity.image} 
                  alt={charity.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{charity.name}</h3>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <Globe className="w-4 h-4 mr-1" />
                    {charity.location}
                  </div>

                  <p className="text-gray-600 mb-4">{charity.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {charity.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {charity.monthlyDonors} monthly donors
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        KES {charity.monthlyGoal} monthly goal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/charities')}
              className="bg-purple-100 text-purple-600 hover:bg-purple-200 px-8 py-3 rounded-full font-semibold transition duration-300 inline-flex items-center"
            >
              View All Charities
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Making a Difference Today
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Your monthly donation can help keep girls in school and create lasting change in communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/donate')}
              className="bg-white text-purple-700 hover:bg-purple-100 px-8 py-3 rounded-full font-semibold transition duration-300"
            >
              Start Donating
            </button>
            <button 
              onClick={() => navigate('/charities')}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 text-white px-8 py-3 rounded-full font-semibold transition duration-300"
            >
              View Charities
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;