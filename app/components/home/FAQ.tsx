import { HelpCircle } from "lucide-react";

export function FAQ() {
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

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-dark-300">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-light-100 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-success-500 rounded-full p-1 shrink-0">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-dark-300">
                    {faq.question}
                  </h3>
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
