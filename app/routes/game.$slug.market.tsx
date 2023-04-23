import { PageLayout } from "../components/layout/PageLayout";
import { useParams } from "@remix-run/react";

export default function Market() {
  const params = useParams();
  return (
    <PageLayout>
      {params.slug}
      <h3>Market</h3>
    </PageLayout>
  );
}
