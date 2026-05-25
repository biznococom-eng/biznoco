import { CampaignReport } from "@/components/campaigns/CampaignReport";

export const metadata = {
  title: "Báo cáo chiến dịch · Biznoco",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  return <CampaignReport campaignId={id} />;
}
