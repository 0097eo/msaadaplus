import { Heart, Users, Building, ShieldCheck, Sparkles, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const impactStats = [
    { number: '20%', label: 'School days missed annually' },
    { number: '24', label: 'Weeks of learning lost' },
    { number: '18+', label: 'Weeks lost in primary school' },
    { number: '144', label: 'Total weeks in high school' }
  ];

  const navigate = useNavigate();

  const allSteps = [
    {
      section: "For Donors",
      steps: [
        {
          icon: <Users className="w-6 h-6 text-purple-500" />,
          title: "Browse Verified Charities",
          description: "Explore our carefully vetted organizations working to provide menstrual supplies and facilities."
        },
        {
          icon: <Heart className="w-6 h-6 text-purple-500" />,
          title: "Choose Your Impact",
          description: "Select a charity and set up monthly donations that fit your budget."
        },
        {
          icon: <Sparkles className="w-6 h-6 text-purple-500" />,
          title: "Track Your Impact",
          description: "Receive updates about beneficiaries and see how your donations make a difference."
        }
      ]
    },
    {
      section: "For Charities",
      steps: [
        {
          icon: <Building className="w-6 h-6 text-purple-500" />,
          title: "Apply to Join",
          description: "Submit your organization's details for our verification process."
        },
        {
          icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
          title: "Get Verified",
          description: "Once approved, set up your charity profile and start receiving donations."
        },
        {
          icon: <Globe className="w-6 h-6 text-purple-500" />,
          title: "Share Your Impact",
          description: "Post beneficiary stories and maintain transparent donation tracking."
        }
      ]
    }
  ];

  const handleButtonClick = () => {
    navigate('/signup');
  }

  return (
    <div className="min-h-screen">
      {/* Mission Section */}
      <section className="relative bg-gradient-to-r from-purple-700 to-pink-600 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Girls Through Continuous Support
            </h1>
            <p className="text-xl mb-12 text-purple-100">
              We’re bridging the education gap by connecting generous donors with verified organizations 
              providing menstrual supplies and facilities to school girls in sub-Saharan Africa.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg p-6 rounded-lg text-center">
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-purple-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">The Challenge We’re Addressing</h2>
            <div className="prose lg:prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                In most sub-Saharan countries, school-going girls face a significant challenge: 
                limited access to essential menstrual supplies and facilities. This isn’t just 
                about comfort – it’s about education, dignity, and future opportunities.
              </p>
              <p className="mb-6">
                According to 2016 studies from the Ministry of Education, girls from poor families 
                miss up to 20% of school days annually due to lack of sanitary towels. The impact 
                is staggering: primary school girls can lose up to 18 weeks of learning out of 108 
                weeks, while high school students might miss almost 24 weeks out of 144 weeks.
              </p>
              <p>
                Our partnered organizations are working not only to provide sanitary towels but 
                also to ensure access to clean water and proper sanitation facilities, aligning 
                with UNICEF’s guidelines for proper menstrual hygiene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
          
          <div className="max-w-3xl mx-auto">
            {allSteps.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-16 last:mb-0">
                <h3 className="text-2xl font-bold text-center mb-12 text-purple-600">{section.section}</h3>
                
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-200" />
                  
                  {/* Steps */}
                  <div className="space-y-12">
                    {section.steps.map((step, index) => (
                      <div key={index} className="relative flex items-start">
                        {/* Number circle */}
                        <div className="absolute left-4 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold">
                          {index + 1}
                        </div>
                        
                        {/* Content */}
                        <div className="ml-16 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 w-full">
                          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            {step.icon}
                          </div>
                          <h4 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h4>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Us in Making a Difference
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Whether you’re a donor looking to create lasting impact or a charity working to provide essential support,
            we’re here to help you make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleButtonClick} className="bg-white text-purple-700 hover:bg-purple-100 px-8 py-3 rounded-full font-semibold transition duration-300">
              Start Donating
            </button>
            <button onClick={handleButtonClick} className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 text-white px-8 py-3 rounded-full font-semibold transition duration-300">
              Apply as Charity
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;