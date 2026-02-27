import TradeCopier from "@/components/admin/TradeCopier";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade Copier | AlgoFinTech Admin",
  description:
    "Manage NinjaTrader trade copier — master/slave accounts, contract sizes, and trade event history.",
};

export default function TradeCopierPage() {
  return <TradeCopier />;
}
