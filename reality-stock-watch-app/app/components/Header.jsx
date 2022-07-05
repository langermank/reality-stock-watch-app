import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header class="Header-wrapper">
      <div class="Header-inner-wrapper LayoutContent-inner-content-wrapper">
        <a class="Header-logo-link" href="/">
          <img 
            class="Header-logo"
            src="images/logo.png"
            alt="Reality Stocker Watch App logo" />
        </a>

        <nav class="Header-navigation-wrapper">
          <ul>
            <li>
              <Link to='/shows' className="Header-navigation-item">
                Shows
              </Link>
            </li>

            <li>
              <Link to='/leaderboards' className="Header-navigation-item">
                Leaderboards
              </Link>
            </li>

            <li>
              <Link to='/about' className="Header-navigation-item">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
