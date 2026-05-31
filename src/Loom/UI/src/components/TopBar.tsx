import React from 'react';

export const TopBar = () => {
  return (
    <React.Fragment>
      <div className="flex justify-start flex-row w-full mt-10 items-center">
        <img src="/loom48.svg" alt="Loom logo" className="h-18 w-18 ml-8 md:ml-16" />
        <h1 className="dark:text-logo-dark logo-font text-4xl md:text-6xl ml-4 md:ml-8 translate-y-2">loom</h1>
      </div>
    </React.Fragment>
  );
};