import { Link } from "react-router";
import { Button } from "~/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/assets/images/Logo For our system.png"
                alt="Restaurant Logo"
                className="h-25 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">
                Restaurant
              </span>
            </Link>

            {/* Login Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                >
                  Student Login
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                >
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - To be added later */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Content will be added here */}
      </main>
    </div>
  );
};

export default Home;
