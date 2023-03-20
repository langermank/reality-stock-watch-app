import PageLayout from "../components/layout/PageLayout";
import { useParams } from "@remix-run/react";

export default function Game() {
  const params = useParams();
  return (
    <PageLayout>
      {params.cycleSlug}
      <h3>Cycle</h3>
    </PageLayout>
  );
}
