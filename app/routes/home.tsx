import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Youtube, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/Logo For our system.png"
              alt="Restaurant Logo"
              className="h-16 w-35 object-contain rounded-[15px]"
            />
            <span className="text-xl font-bold text-gray-800">Restaurant</span>
          </div>

          <div className="flex gap-3">
            <Link to="/auth/login">
              <Button
                variant="default"
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                Student login
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button
                variant="default"
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className=" ">
        <div className="bg-blue-500 rounded-3xl p-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to School Restaurant
            </h1>

            <p className="text-lg mb-8 leading-relaxed">
              Experience the future of campus dining with our digital payment
              system. Quick, secure, and convenient meals for every student.
            </p>

            <div className="flex gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white hover:bg-gray-100 text-black font-semibold px-8 border-0"
              >
                Learn more
              </Button>
            </div>

            {/* Social Media Section */}
            <div className="mb-8">
              <p className="text-sm font-semibold mb-4">
                Follow Us On Social Media
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Features Cards */}
            <div className="bg-white rounded-2xl p-8 text-gray-800">
              <div className="grid md:grid-cols-3 gap-8">
                {/* QR Code Payments */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm12 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">QR Code Payments</h3>
                  <p className="text-sm text-gray-600">
                    Secure and fast payment system using QR codes. No more cash
                    or card hassles during meal times.
                  </p>
                </div>

                {/* Mobile Friendly */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Mobile Friendly</h3>
                  <p className="text-sm text-gray-600">
                    Access your account, check balance, and make payments right
                    from your smartphone.
                  </p>
                </div>

                {/* Secure & Protected */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Mobile Friendly</h3>
                  <p className="text-sm text-gray-600">
                    Your payments and personal information are protected with
                    enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Our Services */}
            <div>
              <h4 className="font-bold text-lg mb-4">Our Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Digital Meal Payments</li>
                <li>Subscription Management</li>
                <li>Balance Tracking</li>
                <li>Meal Planning</li>
              </ul>
            </div>

            {/* Our Location */}
            <div>
              <h4 className="font-bold text-lg mb-4">Our Location</h4>
              <div className="text-gray-300 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-red-500">📍</span>
                  <span>Kigali, Rwanda</span>
                </p>
                <p>Mon-Fri: 7:00 AM - 8:00 PM</p>
                <p>Sat-Sun: 8:00 AM - 6:00 PM</p>
              </div>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact Us</h4>
              <div className="text-gray-300 space-y-2">
                <p className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+250791268906</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>michelmunezero25@gmail.com</span>
                </p>
                <p>Support: 24/7 Available</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/auth/login" className="hover:text-white">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© 2025 School Restaurant System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
