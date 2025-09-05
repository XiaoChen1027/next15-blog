import { redirect } from "next/navigation";

import { SeriesEditForm } from "@/features/admin";
import { auth } from "@/lib/auth";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign_in");
  }

  const params = await props.params;

  return <SeriesEditForm seriesId={params.id} />;
}
