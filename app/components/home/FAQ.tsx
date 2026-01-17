import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What if I lose my phone?",
      answer:
        "You can access your account from any device using your login, or request a printed ticket from the restaurant staff.",
    },
    {
      question: "Can I still eat if I forget my QR code?",
      answer:
        "Yes! Staff can look up your account or issue a temporary ticket. You can also access your QR code from any browser.",
    },
    {
      question: "Can I check my meals later?",
      answer:
        "Absolutely! Your complete meal history is available anytime from your account. Check what you ate, when, and where.",
    },
    {
      question: "Do I need to install an app?",
      answer:
        "No! Everything works through your web browser. No downloads, no installations. Just open the link and you're ready.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-dark-300">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`bg-light-100 rounded-2xl border border-gray-100/10 overflow-hidden transition-all duration-300 ${
                openIndex === idx ? "shadow-lg bg-white" : "hover:shadow-md"
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`mt-1 rounded-full p-1 shrink-0 transition-colors ${
                      openIndex === idx ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  >
                    <HelpCircle
                      className={`w-4 h-4 ${
                        openIndex === idx ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-bold transition-colors ${
                      openIndex === idx ? "text-primary-500" : "text-dark-300"
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-primary-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out px-6 ${
                  openIndex === idx
                    ? "max-h-40 pb-6 opacity-100"
                    : "max-h-0 pb-0 opacity-0"
                }`}
              >
                <div className="pl-11">
                  <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
