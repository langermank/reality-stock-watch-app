import shows from "~/data/show.json";
import seasons from "~/data/season.json";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import leaderboards from "~/data/leaderboard.json";
import season from "../season";

// export const loader = ({ params: { short_name } }) => {
//   const season = seasons.find((c) => c.short_name === short_name);
//   const show = shows.find((c) => c.short_name === short_name);
//   return { season, show };
// };

export const loader = ({ params: { id } }) => {
  const leaderboard = leaderboards.find((c) => c.id === id);
  const currentSeason = seasons.find((c) => c.id === id);
  return json({ leaderboard, currentSeason });
};

// export const loader = async () => {
//   return {
//     seasons,
//     leaderboards,
//   };
// };

// export const loader = ({ params }) => {
//   //   const leaderboard = leaderboards.find((c) => c.id === id);
//   const currentSeason = params.id;
//   return { currentSeason };
// };

export default () => {
  const leaderboard = useLoaderData();
  const currentSeason = useLoaderData();
  console.log(currentSeason);
  return (
    <>
      {/* {!posts || posts.length === 0 ? (
        <div className="w-full pt-12 text-center text-gray-300 dark:text-gray-500">
          No posts
        </div>
      ) : (
        posts?.map((post) => <Post key={post.id} post={post} />)
      )} */}
      {/* <pre>{JSON.stringify(leaderboard, null, 2)}</pre> */}

      <div>
        {/* {leaderboards.map((leaderboard, season) => (
          <>
            <p>{season.id}</p>
            <p key={leaderboard.id}>{leaderboard.id}</p>
          </>
        ))} */}
      </div>
    </>
  );
};

// export const loader = async ({ params }) => {
// //   const userId = await getSessionUserId(request);
//   const posts = await getUserPostsReplies({
//     username: params.username,
//     userId,
//   });
//   return json({ posts });
// };

// export default function UserPosts() {
//   const { posts } = useLoaderData();

//   return (
//     <>
//       {!posts || posts.length === 0 ? (
//         <div className="w-full pt-12 text-center text-gray-300 dark:text-gray-500">
//           No posts
//         </div>
//       ) : (
//         posts?.map((post) => <Post key={post.id} post={post} />)
//       )}
//     </>
//   );
// }
