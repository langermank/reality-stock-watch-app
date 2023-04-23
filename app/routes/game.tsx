import { Outlet } from "@remix-run/react";
import { PageLayout } from "../components/layout/PageLayout";

export default function Index() {
  return (
    <PageLayout>
      <h3>Games - Main page</h3>

      <Outlet />
    </PageLayout>
  );
}
