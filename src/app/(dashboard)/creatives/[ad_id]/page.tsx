import { CreativeDetailContainer } from "@/components/creatives/CreativeDetailContainer";

export const metadata = {
  title: "Chi tiết creative · Biznoco",
};

interface PageProps {
  params: Promise<{ ad_id: string }>;
}

export default async function CreativeDetailPage({ params }: PageProps) {
  const { ad_id } = await params;
  const accountId = process.env.NEXT_PUBLIC_DEMO_ACCOUNT_ID;
  return <CreativeDetailContainer accountId={accountId} adId={ad_id} />;
}
