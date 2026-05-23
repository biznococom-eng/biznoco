import { CreativeDetailWrapper } from "@/components/creatives/CreativeDetailWrapper";

export const metadata = {
  title: "Chi tiết creative · Biznoco",
};

interface PageProps {
  params: Promise<{ ad_id: string }>;
}

export default async function CreativeDetailPage({ params }: PageProps) {
  const { ad_id } = await params;
  return <CreativeDetailWrapper adId={ad_id} />;
}
