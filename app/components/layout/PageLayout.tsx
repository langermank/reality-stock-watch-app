import React from "react";

export type PageLayoutProps = {
  containerAlign?: "center";
  containerCol?: "single" | "split";
  children?: React.ReactNode;
};

export function PageLayout({
  containerAlign = "center",
  containerCol = "single",
  children,
}: PageLayoutProps) {
  return (
    <div className='PageLayout'>
      <div className='PageLayout-content' data-container-align={containerAlign}>
        <div className='PageLayout-container' data-container-col={containerCol}>
          {children}
        </div>
      </div>
    </div>
  );
}

PageLayout.displayName = "PageLayout";
