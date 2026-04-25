import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { CurrencyProvider } from "@/hooks/useCurrency";
import "@/index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sipinvestment-calculator.vercel.app"),
  title: {
    default: "Advanced SIP Calculator with Inflation & Step-Up | InvestCalc",
    template: "%s | InvestCalc",
  },
  description:
    "Calculate real returns with our advanced SIP Calculator featuring inflation adjustment, multi-currency support, reverse goal planning, and SWP retirement strategies.",
  keywords: [
    "SIP calculator with inflation",
    "reverse goal sip planner",
    "step up sip calculator for wealth",
    "swp calculator with inflation india",
    "lump sum compounding calculator with inflation",
    "monthly sip for 1 crore",
    "usd sip calculator with inflation adjustment",
  ],
  authors: [{ name: "InvestCalc" }],
  openGraph: {
    type: "website",
    url: "https://sipinvestment-calculator.vercel.app/",
    title: "SIP Calculator with Inflation & Multi-Currency | InvestCalc",
    description:
      "Calculate real returns with our advanced SIP Calculator featuring inflation adjustment, multi-currency support, reverse goal planning, and SWP strategies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InvestCalc - Smart Investment Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIP Calculator with Inflation & Multi-Currency | InvestCalc",
    description:
      "Calculate real returns with our advanced SIP Calculator featuring inflation adjustment, multi-currency support, reverse goal planning, and SWP strategies.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "qrL-MopTSRNRvG4H93arJctg6MJP_whYq2_km6kP0gg",
  },
  alternates: {
    canonical: "https://sipinvestment-calculator.vercel.app/",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "InvestCalc",
  url: "https://sipinvestment-calculator.vercel.app/",
  description:
    "Calculate returns for SIP, Step-Up SIP, Lump Sum investments, and manage retirement income with our SWP tool.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
};

const financialProductSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "Investment Calculators",
  description:
    "Calculators for SIP, Lumpsum, and SWP to help plan your financial future.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(financialProductSchema),
          }}
        />
      </head>
      <body>
        <CurrencyProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
