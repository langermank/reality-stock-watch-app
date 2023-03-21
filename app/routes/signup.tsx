import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { getWebAuth } from "../services/web-authenticator";

export const action = async ({ request, context }: ActionArgs) => {
  // const formData = await request.formData();
  // const username = formData.get('username');
  // const password = formData.get('password');
  // return json({ result: `Hi ${username}. You password is ${password}` });
  const webAuth = await getWebAuth();
  const result = await webAuth.authenticate("form", request, {
    successRedirect: "/protected",
    failureRedirect: "/login",
    //throwOnError: true,
    context,
  });
  console.log(result);
  return result;
};

export const loader = async ({ request }: LoaderArgs) => {
  const webAuth = await getWebAuth();
  await webAuth.isAuthenticated(request, {
    successRedirect: "/protected",
  });

  return json({});
};

export default function Login() {
  const errorData = useLoaderData();
  //const actionData = useActionData();

  return (
    <>
      <div>Sign up</div>
      <span>{errorData && errorData.message}</span>
      <Form method='post'>
        <input name='username' type='text' />
        <br />
        <input name='password' type='password' />
        <br />
        <button type='submit'>Sign in</button>
      </Form>
    </>
  );
}
