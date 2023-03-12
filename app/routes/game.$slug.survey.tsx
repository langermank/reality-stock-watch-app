import PageLayout from "../components/PageLayout";
import { useParams } from "@remix-run/react";

export default function Game() {
  const params = useParams();
  return (
    <PageLayout>
      {params.slug}
      <h3>Survey</h3>
    </PageLayout>
  );
}
