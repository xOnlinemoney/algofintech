import B2CNavbar from "@/components/b2c/B2CNavbar";
import B2CHero from "@/components/b2c/B2CHero";
import B2CHowItWorks from "@/components/b2c/B2CHowItWorks";
import B2CAlgorithms from "@/components/b2c/B2CAlgorithms";
import B2CBrokers from "@/components/b2c/B2CBrokers";
import B2CFeatures from "@/components/b2c/B2CFeatures";
import B2CCTA from "@/components/b2c/B2CCTA";
import B2CFooter from "@/components/b2c/B2CFooter";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlgoFinTech - Automated Trading for Individual Investors",
  description:
    "Connect your brokerage account and let institutional-grade algorithms trade for you. Crypto, Stocks, Forex, and Futures — all on autopilot.",
};

export default function IndividualPage() {
  return (
    <>
      <B2CNavbar />
      <B2CHero />
      <B2CHowItWorks />
      <B2CAlgorithms />
      <B2CBrokers />
      <B2CFeatures />
      <B2CCTA />
      <B2CFooter />
    </>
  );
}
