import React, { PropsWithChildren } from "react";

export const AppShell: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="app-shell app-surface">{children}</div>;
};
