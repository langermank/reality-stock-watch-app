import type { LoaderArgs } from "@remix-run/node";
import PageLayout from "../components/PageLayout";
import { useParams, useLoaderData } from "@remix-run/react";
import { getAppDomain } from "../services/app";

export const loader = async ({ params }: LoaderArgs) => {
  const appDomain = await getAppDomain();
  const store = await appDomain.getStore();

  const season = await store.showSeasons.fetchByUuid("04d8d1a3-d75c-4dd6-ab31-2c01e65911b1");
  console.log(season);
  return {
    data: season,
  };
};

export default function GameSeason() {
  const params = useParams();
  const { data } = useLoaderData<typeof loader>();

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      {params.slug}
      <h3>Game season</h3>
      <div>{data?.slug}</div>
    </div>
  );
}
