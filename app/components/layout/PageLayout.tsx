import type { PropsWithChildren } from "react";

type PageLayoutProps = {
  hideSidebar?: boolean;
};

export default function PageLayout({ children, hideSidebar }: PropsWithChildren<PageLayoutProps>) {
  return (
    <div className='PageLayout LayoutContent-inner-content-wrapper'>
      {/*!hideSidebar ? (
        <div className='PageLayout-side-column'>
          <Sidepane />
        </div>
      ) : null*/}

      <div className='PageLayout-main-content'>{children}</div>
    </div>
  );
}
