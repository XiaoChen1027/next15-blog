import { redirect } from "next/navigation";

import { SeriesCreateForm } from "@/features/admin";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign_in");
  }

  return <SeriesCreateForm />;
}
