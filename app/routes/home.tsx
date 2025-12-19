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
  Utensils,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-light-200 font-inter">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 p-2 rounded-xl">
                <Utensils className="w-8 h-8 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-dark-300">
                Restaurant<span className="text-primary-500">System</span>
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <Link to="/auth/login">
                <Button className="bg-primary-500 hover:bg-primary-100 text-white shadow-lg shadow-primary-500/20 transition-all duration-300 rounded-full px-6">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-500 font-medium text-sm mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                  </span>
                  Smart Dining Experience
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-dark-300">
                  Delicious Meals, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-100">
                    Digital Payments
                  </span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Skip the line and enjoy your food. The smartest way to manage
                  meal plans, payments, and dining at your campus.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth/signup">
                    <Button
                      size="lg"
                      className="bg-primary-500 hover:bg-primary-100 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-primary-500/20 transition-all hover:scale-105"
                    >
                      Get Started Now
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-500 px-8 py-6 text-lg rounded-full transition-all"
                  >
                    View Menu
                  </Button>
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent rounded-full blur-3xl transform translate-x-10 translate-y-10"></div>
                <img
                  src="/assets/images/hero-img.png"
                  alt="Delicious Food"
                  className="relative z-10 w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-300">
                Why Choose Our System?
              </h2>
              <p className="text-gray-500 text-lg">
                We provide a seamless dining experience with top-notch security
                and convenience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <QrCode className="w-8 h-8 text-white" />,
                  title: "QR Code Payments",
                  desc: "Scan and pay in seconds. No cash needed, just your smartphone.",
                  color: "bg-primary-500",
                },
                {
                  icon: <Smartphone className="w-8 h-8 text-white" />,
                  title: "Mobile First",
                  desc: "Manage your account and track expenses on the go.",
                  color: "bg-navy-500",
                },
                {
                  icon: <Shield className="w-8 h-8 text-white" />,
                  title: "Secure Transactions",
                  desc: "Bank-grade security for all your payments and data.",
                  color: "bg-success-500",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-8 rounded-3xl bg-light-200 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-dark-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="bg-primary-500 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/images/pattern.png')] opacity-10"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Ready to upgrade your dining experience?
                </h2>
                <p className="text-primary-50 text-lg mb-10">
                  Join thousands of students enjoying hassle-free meals today.
                </p>
                <Link to="/auth/signup">
                  <Button className="bg-white text-primary-500 hover:bg-gray-100 px-10 py-6 text-lg rounded-full font-bold shadow-xl transition-transform hover:scale-105">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary-50 p-1.5 rounded-lg">
                  <Utensils className="w-6 h-6 text-primary-500" />
                </div>
                <span className="text-xl font-bold text-dark-300">
                  RestaurantSys
                </span>
              </div>
              <p className="text-gray-500 mb-6">
                Making campus dining smarter, faster, and more enjoyable for
                everyone.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-light-200 flex items-center justify-center text-gray-500 hover:bg-primary-500 hover:text-white transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-dark-300">
                Quick Links
              </h4>
              <ul className="space-y-4 text-gray-500">
                <li>
                  <Link
                    to="/"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/login"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/signup"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Menu
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-dark-300">Support</h4>
              <ul className="space-y-4 text-gray-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-500 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-dark-300">Contact</h4>
              <ul className="space-y-4 text-gray-500">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                  Kigali, Rwanda
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                  +250 791 268 906
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                  michelmunezero25@gmail.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 School Restaurant System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
