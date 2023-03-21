import React from "react";

export type PageLayoutProps = {
  containerWidth?: "sm" | "md" | "lg" | "xl";
  containerAlign?: "left" | "center" | "right";
  children?: React.ReactNode;
};

export function PageLayout({
  containerWidth = "md",
  containerAlign = "center",
  children,
}: PageLayoutProps) {
  return (
    <div className='PageLayout'>
      <div
        className='PageLayout-content'
        data-container-align={containerAlign}
        // data-container-width={containerWidth}
      >
        <div className='PageLayout-container'>{children}</div>
      </div>
    </div>
  );
}

PageLayout.displayName = "PageLayout";
