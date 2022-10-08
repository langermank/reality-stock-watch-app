// dont think we need this index
// import { useLoaderData, Link } from "@remix-run/react";
// import shows from "~/data/show.json";

// export const loader = async () => {
//   return {
//     shows,
//   };
// };

// export default function Index() {
//   const { shows } = useLoaderData();

//   return (
//     <div>
//       <h1>List all shows</h1>
//       {shows.map((show) => (
//         <p key={show.id}>
//           <Link to={`${show.short_name}`}>{show.name}</Link>
//         </p>
//       ))}
//     </div>
//   );
// }
