import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getEventDetailPayload } from "@/lib/events/get-event-detail-payload";
import EventDetailPageClient from "./EventDetailPageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const payload = await getEventDetailPayload(id, session?.user?.id);
  if (!payload) notFound();

  return <EventDetailPageClient key={id} eventId={id} initialPayload={payload} />;
}
