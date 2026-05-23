import { CreativesContainer } from "@/components/creatives/CreativesContainer";

export const metadata = {
  title: "Creative Analytics · Biznoco",
  description:
    "Phân tích Hook Rate, Hold Rate, CTR, ROAS theo từng creative Facebook Ads.",
};

export default function CreativesPage() {
  const accountId = process.env.NEXT_PUBLIC_DEMO_ACCOUNT_ID;
  return <CreativesContainer accountId={accountId} />;
}
