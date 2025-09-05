import { redirect } from "next/navigation";

import { getSeries } from "@/features/series";
import { auth } from "@/lib/auth";
import { AdminSeriesListPage } from "@/features/admin/pages/series";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign_in");
  }

  const { series, total } = await getSeries({
    pageIndex: 1,
    pageSize: 100,
  } as { pageIndex: number; pageSize: number });

  return <AdminSeriesListPage series={series} total={total} />;
}
