import { Button } from "~/components/core/button/Button";
import { Input } from "~/components/core/Input/Input";
import type { MetaFunction } from "@remix-run/node";
import { TwitterLogo, DiscordLogo, GoogleLogo, TwitchLogo } from "phosphor-react";

export const meta: MetaFunction = () => {
  return {
    title: "Something cool",
    description: "This becomes the nice preview on search results.",
  };
};

export default function Login() {
  return (
    <div>
      <h2>Login</h2>
      <Input label='Email' id='email' />
      <Input label='Password' id='password' />
      <Button variant='primary'>Login</Button>
      <h3>SSO</h3>
      <div>
        <Button variant='primaryGhost' iconSpacing='spacious' width='full' icon={<TwitchLogo />}>
          Twitch
        </Button>
        <Button variant='primaryGhost' iconSpacing='spacious' width='full' icon={<TwitterLogo />}>
          Twitter
        </Button>
        <Button variant='primaryGhost' iconSpacing='spacious' width='full' icon={<DiscordLogo />}>
          Discord
        </Button>
        <Button variant='primaryGhost' iconSpacing='spacious' width='full' icon={<GoogleLogo />}>
          Google
        </Button>
      </div>
    </div>
  );
}
