import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
}>;

export const MainLayout: React.FC<Props> = ({ left, right, bottom, children }) => {
  return (
    <div className="main-layout">
      {left && <aside className="side-panel">{left}</aside>}
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
      {right && <aside className="side-panel right min-h-0 overflow-auto">{right}</aside>}
      {bottom && <div className="playback-bar">{bottom}</div>}
    </div>
  );
};
