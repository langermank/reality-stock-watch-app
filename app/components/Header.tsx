import { Link } from "@remix-run/react";
import { Button } from "./core/button/Button";
import { Sidebar } from "phosphor-react";

export const Header = () => {
  return (
    <header>
      <a href='/'>
        <img src='images/logo.png' alt='Reality Stock Watch App' />
      </a>
      <Button iconOnly size='small' icon={<Sidebar />}>
        Collapse sidebar
        {/* expand sidebar */}
      </Button>
    </header>
  );
};

export default Header;
