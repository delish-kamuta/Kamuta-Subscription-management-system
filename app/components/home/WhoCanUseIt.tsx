import { GraduationCap, Briefcase, Utensils, Check } from "lucide-react";

export function WhoCanUseIt() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-300">
            Who Can Use It?
          </h2>
          <p className="text-gray-500 text-lg">
            Everyone on campus can enjoy easy, tracked meals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <GraduationCap className="w-8 h-8 text-white" />,
              title: "Students",
              features: [
                "Use your subscription",
                "Scan QR or show ticket",
                "See remaining meals",
              ],
              bg: "bg-blue-50",
              iconBg: "bg-blue-500",
              checkColor: "text-blue-500",
            },
            {
              icon: <Briefcase className="w-8 h-8 text-white" />,
              title: "Campus Workers",
              features: [
                "Use prepaid meals or credit",
                "Balance updates automatically",
                "No confusion at the counter",
              ],
              bg: "bg-purple-50",
              iconBg: "bg-purple-500",
              checkColor: "text-purple-500",
            },
            {
              icon: <Utensils className="w-8 h-8 text-white" />,
              title: "Walk-in Customers",
              features: [
                "Pay and receive ticket",
                "Scan and get served",
                "No account required",
              ],
              bg: "bg-yellow-50",
              iconBg: "bg-yellow-500",
              checkColor: "text-yellow-500",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`group p-8 rounded-3xl ${item.bg} hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl transition-all duration-300`}
            >
              <div
                className={`w-16 h-16 ${item.iconBg} rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto`}
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-6 text-dark-300 text-center">
                {item.title}
              </h3>
              <ul className="space-y-4">
                {item.features.map((feature, fIdx) => (
                  <li
                    key={fIdx}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <Check className={`w-5 h-5 ${item.checkColor}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
