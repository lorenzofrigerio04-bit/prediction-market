import OperationsDetail from "@/components/admin/operations/OperationsDetail";

export default async function AdminOperationsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OperationsDetail id={id} />;
}
