import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header className="Header-wrapper">
      <div className="Header-inner-wrapper LayoutContent-inner-content-wrapper">
        <a className="Header-logo-link" href="/">
          <img 
            className="Header-logo"
            src="images/logo.png"
            alt="Reality Stocker Watch App logo" />
        </a>

        <nav className="Header-navigation-wrapper">
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
