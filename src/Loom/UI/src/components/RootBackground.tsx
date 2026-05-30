import React from 'react';

export const RootBackground = ({children}: React.PropsWithChildren<{}>) => {
  return (
    <React.Fragment>
      <div className="flex flex-col min-h-screen min-w-full h-dvh bg-slate-100 dark:bg-deep-purple">
        {children}
      </div>
    </React.Fragment>
  );
};