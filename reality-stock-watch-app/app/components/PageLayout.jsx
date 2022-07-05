import Sidebar from './Sidebar';

export default function PageLayout({ children, hideSidebar }) {
  return (
    <div class="PageLayout LayoutContent-inner-content-wrapper">
      {!hideSidebar 
      ?  (
        <div class="PageLayout-side-column">
          <Sidebar />
        </div>
      )
      : null}

      <div class="PageLayout-main-content">
        {children}
      </div>
    </div>
  )
}
