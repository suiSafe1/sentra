// App.jsx (or main file where you use the components)
import React from "react";
import { VestingCreator } from "../components/VestingCreator";
import { VestingTable } from "../components/VestingTable";

export const App = () => {
  return (
    <div className='bg-gray-900 p-4 sm:p-8 min-h-screen'>
      {/* The wrapper div containing both responsive components */}
      <div className='flex flex-col gap-10 mx-auto max-w-6xl'>
        {/* Component 1: Vesting Creator Form */}
        <VestingCreator />

        {/* Component 2: Vesting Schedule Table */}
        <VestingTable />
      </div>
    </div>
  );
};
