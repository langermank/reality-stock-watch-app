import Sidebar from './Sidebar';

export default function PageLayout({ children, hideSidebar }) {
  return (
    <div className="PageLayout LayoutContent-inner-content-wrapper">
      {!hideSidebar 
      ?  (
        <div className="PageLayout-side-column">
          <Sidebar />
        </div>
      )
      : null}

      <div className="PageLayout-main-content">
        {children}
      </div>
    </div>
  )
}
