import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  QrCode,
  Smartphone,
  Shield,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/Logo For our system.png"
                alt="Restaurant Logo"
                className="h-14 w-auto object-contain rounded-xl shadow-sm"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Restaurant
              </span>
            </div>

            <div className="flex gap-3">
              <Link to="/auth/login">
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Student Login
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/30 rounded-full -ml-48 -mb-48 blur-3xl"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to School Restaurant
            </h1>

            <p className="text-xl md:text-2xl mb-10 leading-relaxed text-blue-50 max-w-2xl mx-auto">
              Experience the future of campus dining with our digital payment
              system. Quick, secure, and convenient meals for every student.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link to="/auth/signup">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold px-10 py-6 text-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>

            {/* Social Media Section */}
            <div className="mb-12">
              <p className="text-sm font-semibold mb-5 tracking-wide uppercase">
                Connect With Us
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Features Cards */}
            <div className="bg-white rounded-3xl p-10 text-gray-800 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                Why Choose Us?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {/* QR Code Payments */}
                <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                    <QrCode className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    QR Code Payments
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Secure and fast payment system using QR codes. No more cash
                    or card hassles during meal times.
                  </p>
                </div>

                {/* Mobile Friendly */}
                <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                    <Smartphone className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Mobile Friendly
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Access your account, check balance, and make payments right
                    from your smartphone.
                  </p>
                </div>

                {/* Secure & Protected */}
                <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                    <Shield className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Secure & Protected
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
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
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Our Services */}
            <div>
              <h4 className="font-bold text-xl mb-5 text-white">
                Our Services
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Digital Meal Payments
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Subscription Management
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Balance Tracking
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Meal Planning
                </li>
              </ul>
            </div>

            {/* Our Location */}
            <div>
              <h4 className="font-bold text-xl mb-5 text-white">
                Our Location
              </h4>
              <div className="text-gray-300 space-y-3">
                <p className="flex items-start gap-3 hover:text-white transition-colors">
                  <span className="text-red-500 text-xl">📍</span>
                  <span>Kigali, Rwanda</span>
                </p>
                <div className="space-y-2 pl-8 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Mon-Fri: 7:00 AM - 8:00 PM
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Sat-Sun: 8:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-bold text-xl mb-5 text-white">Contact Us</h4>
              <div className="text-gray-300 space-y-3">
                <a
                  href="tel:+250791268906"
                  className="flex items-center gap-3 hover:text-white transition-colors group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    📞
                  </span>
                  <span>+250 791 268 906</span>
                </a>
                <a
                  href="mailto:michelmunezero25@gmail.com"
                  className="flex items-center gap-3 hover:text-white transition-colors group break-all"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    ✉️
                  </span>
                  <span>michelmunezero25@gmail.com</span>
                </a>
                <p className="flex items-center gap-3 text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Support: 24/7 Available
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-xl mb-5 text-white">Quick Links</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    to="/auth/login"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-white transition-colors"></span>
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/signup"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-white transition-colors"></span>
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/login"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-white transition-colors"></span>
                    Help Center
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-white transition-colors"></span>
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 School Restaurant System. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Built with ❤️ for students by students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
