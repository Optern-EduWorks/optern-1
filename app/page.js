'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      const scrollThreshold = 50;

      if (currentScrollY > scrollThreshold) {
        if (currentScrollY > lastScrollY && isHeaderVisible) {
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY && !isHeaderVisible) {
          setIsHeaderVisible(true);
        }
      } else if (currentScrollY <= scrollThreshold && !isHeaderVisible) {
        setIsHeaderVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    let lastScrollY = 0;
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeaderVisible]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Header/Navigation Bar */}
      <header className={`bg-white shadow-xl py-4 px-6 md:px-12 sticky top-0 z-50 rounded-b-xl ${isHeaderVisible ? 'header-visible' : 'header-hidden'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <img src="/favicon.ico" alt="Optern EduWorks Logo" className="h-8 w-auto mr-2" />
            <div className="text-xl font-extrabold text-navy-800">Optern EduWorks</div>
          </div>
          <nav className="hidden md:flex space-x-6 items-center">
            <a href="#students" className="text-gray-600 hover:text-sky-600 font-medium transition duration-300">Students</a>
            <a href="#recruiters" className="text-gray-600 hover:text-sky-600 font-medium transition duration-300">Recruiters</a>
            <a href="#institutions" className="text-gray-600 hover:text-sky-600 font-medium transition duration-300">Institutions</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-sky-600 font-medium transition duration-300">How It Works</a>
            <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
              Get Started
            </button>
          </nav>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 focus:outline-none" onClick={toggleMobileMenu}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-end mb-8">
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none" onClick={toggleMobileMenu}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="#students" className="text-gray-800 hover:text-sky-600 font-medium text-lg block" onClick={toggleMobileMenu}>For Students</a>
          <a href="#recruiters" className="text-gray-800 hover:text-sky-600 font-medium text-lg block" onClick={toggleMobileMenu}>For Recruiters</a>
          <a href="#institutions" className="text-gray-800 hover:text-sky-600 font-medium text-lg block" onClick={toggleMobileMenu}>For Institutions</a>
          <a href="#how-it-works" className="text-gray-800 hover:text-sky-600 font-medium text-lg block" onClick={toggleMobileMenu}>How It Works</a>
          <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105 w-full mt-4">
            Get Started
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="gradient-hero text-white py-24 md:py-40 overflow-hidden rounded-b-3xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-6 fade-in-on-scroll font-poppins">
            Empowering Students, Connecting Startups.
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-8 max-w-5xl mx-auto fade-in-on-scroll delay-100">
            Optern is India’s next-gen platform that bridges the gap between learners and industry.
          </h2>
          <p className="text-base font-semibold mb-12 text-yellow-300 uppercase tracking-widest fade-in-on-scroll delay-200">
            Learn. Build. Grow — with the power of real experience.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 fade-in-on-scroll delay-300">
            <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-lg">
              🎓 For Students → Explore Opportunities
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 text-lg">
              🏢 For Recruiters → Post an Opportunity
            </button>
            <button className="bg-gray-400 text-white font-semibold py-4 px-10 rounded-full shadow-lg cursor-not-allowed text-lg">
              🏫 For Institutions → Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section id="students" className="bg-pattern-students py-16 md:py-28 mx-auto max-w-7xl mt-8 px-6 md:px-12 rounded-xl shadow-2xl fade-in-on-scroll">
        <div className="content-relative">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy-800 text-center mb-16 font-poppins">Your Career, Supercharged by Real Experience</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left CTA/Image Column */}
            <div className="lg:col-span-1 flex flex-col items-center fade-in-on-scroll">
              <p className="text-xl text-black-800 mb-8 max-w-md"><b>Build a future-ready portfolio with live projects, internships, and verifiable achievements</b>.</p>
              <img src="/student_working.jpeg" alt="Image of a student working on a laptop" className="w-full h-auto object-cover rounded-2xl shadow-xl border-4 border-sky-500 transform hover:scale-[1.02] transition duration-300" />
              <button className="w-full mt-8 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition duration-300 transform hover:scale-105 text-lg">
                👉 Join Now — Start Building Your Career
              </button>
            </div>
            
            {/* Right Features Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Feature: AI-Powered Opportunity Match */}
              <div className="gradient-student-card p-6 rounded-xl border-b-4 border-sky-500 feature-card-hover fade-in-on-scroll delay-100">
                <div className="flex items-start mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00A8E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0 animate-pulse"><path d="M12 5c-3.3 0-6 2.7-6 6 0 2.2 1.5 4.1 3.5 4.7l.6 1.9c.2.6.9 1 1.5 1h.8c.6 0 1.3-.4 1.5-1l.6-1.9c2-1.6 3.5-3.5 3.5-4.7 0-3.3-2.7-6-6-6z"/><path d="M12 5v-.5a2.5 2.5 0 0 1 5 0V5"/><path d="M12 5v-.5a2.5 2.5 0 0 0-5 0V5"/></svg>
                  <h3 className="text-xl font-bold text-navy-800">AI-Powered Match</h3>
                </div>
                <p className="text-gray-700">Get personalized project & internship recommendations based on your skills and interests.</p>
              </div>
              
              {/* Feature: Dynamic Skill Profile */}
              <div className="gradient-student-card p-6 rounded-xl border-b-4 border-sky-500 feature-card-hover fade-in-on-scroll delay-200">
                <div className="flex items-start mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00A8E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0 animate-bounce" style={{animationDuration: '4s'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <h3 className="text-xl font-bold text-navy-800">Dynamic Skill Profile</h3>
                </div>
                <p className="text-gray-700">Showcase verified skills, certifications, and achievements in one interactive profile.</p>
              </div>
              
              {/* Feature: Project Showcase Portfolio */}
              <div className="gradient-student-card p-6 rounded-xl border-b-4 border-sky-500 feature-card-hover fade-in-on-scroll delay-300">
                <div className="flex items-start mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00A8E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0 animate-pulse" style={{animationDuration: '2s'}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <h3 className="text-xl font-bold text-navy-800">Project Portfolio</h3>
                </div>
                <p className="text-gray-700">Display completed projects with mentor sign-offs to stand out from the crowd.</p>
              </div>
              
              {/* Feature: Mentorship & Guidance */}
              <div className="gradient-student-card p-6 rounded-xl border-b-4 border-sky-500 feature-card-hover fade-in-on-scroll delay-400">
                <div className="flex items-start mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00A8E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  <h3 className="text-xl font-bold text-navy-800">Mentorship & Guidance</h3>
                </div>
                <p className="text-gray-700">Learn from experts through one-on-one sessions, mock interviews, and skill clinics.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 mt-8 rounded-t-xl fade-in-on-scroll">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-sm">
          <nav className="space-x-4 mb-4">
            <a href="#" className="hover:text-sky-500 transition duration-300">About Optern</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-sky-500 transition duration-300">Privacy Policy</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-sky-500 transition duration-300">Terms & Conditions</a>
            <span className="text-gray-700">|</span>
            <a href="mailto:admin@optern-eduworks.com" className="hover:text-sky-500 transition duration-300">Contact Us</a>
          </nav>
          <p className="mb-2">📧 admin@optern-eduworks.com</p>
          <p>&copy; {currentYear} Optern EduWorks — Empowering Students Through Experience.</p>
        </div>
      </footer>
    </>
  );
}
