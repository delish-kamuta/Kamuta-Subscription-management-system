import {
  CreditCard,
  ArrowRight,
  QrCode,
  Smartphone,
  Soup,
  History,
} from "lucide-react";

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-300">
            How It Works
          </h2>
          <p className="text-gray-500 text-lg">
            Five simple steps to your meal
          </p>
        </div>

        <div className="flex flex-col items-center gap-12 md:gap-20">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-success-500/20 transform hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-dark-300">
                Pay or Subscribe
              </h3>
              <p className="text-sm text-gray-500">Choose your plan</p>
            </div>

            <div className="hidden md:block text-gray-300">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-success-500/20 transform hover:scale-110 transition-transform duration-300">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-dark-300">
                Get QR or Ticket
              </h3>
              <p className="text-sm text-gray-500">Receive your access</p>
            </div>

            <div className="hidden md:block text-gray-300">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-success-500/20 transform hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-dark-300">
                Scan at Kitchen
              </h3>
              <p className="text-sm text-gray-500">Show your code</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-success-500/20 transform hover:scale-110 transition-transform duration-300">
                <Soup className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-dark-300">
                Get Your Meal
              </h3>
              <p className="text-sm text-gray-500">Enjoy your food</p>
            </div>

            <div className="hidden md:block text-gray-300">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-success-500/20 transform hover:scale-110 transition-transform duration-300">
                <History className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-dark-300">
                Check History
              </h3>
              <p className="text-sm text-gray-500">Track anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
