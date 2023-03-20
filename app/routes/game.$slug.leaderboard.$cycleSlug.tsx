import PageLayout from "../components/layout/PageLayout";
import { useParams } from "@remix-run/react";

export default function Game() {
  const params = useParams();
  return (
    <PageLayout>
      {params.slug}
      <h3>Leaderboard week</h3>
    </PageLayout>
  );
}
