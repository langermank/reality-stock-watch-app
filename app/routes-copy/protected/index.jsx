import { useLoaderData } from '@remix-run/react';

import { webAuth } from '../../services/web-authenticator';

export const loader = async ({ request }) => {
  return await webAuth.isAuthenticated(request, {
    failureRedirect: '/login',
  });
};

export default function ProtectedArea() {
  const data = useLoaderData();
  console.log(data);

  return (
    <div>
      Only authorized personnel
    </div>
  )
}
