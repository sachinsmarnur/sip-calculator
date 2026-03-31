import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is the difference between SIP and Step-Up SIP?",
    answer:
      "A standard SIP (Systematic Investment Plan) involves investing a fixed amount every month for a specific duration. A Step-Up SIP allows you to automatically increase your monthly investment by a certain percentage every year (e.g., matching your annual salary hike). Step-Up SIPs generally lead to a much larger maturity corpus because your invested capital grows over time.",
  },
  {
    question: "How does inflation affect my SIP returns?",
    answer:
      "Inflation silently reduces the purchasing power of your money over time. For example, ₹1 Crore (or $1 Million) after 20 years will buy you significantly less than it does today. Our advanced SIP calculator includes an 'Adjust for Inflation' feature that discounts your final maturity value to show its actual worth in today's money, helping you set realistic financial goals.",
  },
  {
    question: "How much SIP is required for 1 Crore in 10 years?",
    answer:
      "To accumulate 1 Crore in 10 years, assuming a 12% annual return, you need to start a monthly SIP of approximately ₹43,041. You can easily reverse-calculate this for your exact desired timeframe and expected return rate using our dedicated Goal Planner Calculator.",
  },
  {
    question: "What is a Systematic Withdrawal Plan (SWP)?",
    answer:
      "An SWP allows you to withdraw a fixed amount periodically from your accumulated mutual fund corpus. It is highly popular for generating a regular monthly income during retirement. Our SWP calculator helps you determine how long your corpus will last based on your withdrawal rate and expected market returns.",
  },
  {
    question: "Can I use this SIP calculator for USD or EUR?",
    answer:
      "Yes, absolutely! Our tool features native Multi-Currency support. You can easily switch between Indian Rupee (₹), US Dollar ($), Euro (€), and British Pound (£) using the currency toggle at the top of the page. All inputs, charts, and tables will instantly adapt to your selected currency.",
  },
];

export function FAQSection() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-12 mb-8 bg-card border border-border/60 shadow-sm rounded-2xl p-6 sm:p-8">
      {/* Inject Google FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <HelpCircle className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-semibold hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base selection:bg-primary/20">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
