// App.jsx (or main file where you use the components)
import { VestingCreator } from "../components/VestingCreator";
import { VestingTable } from "../components/VestingTable";

export const VestLock = () => {
  return (
    <div className='bg-white p-4 sm:p-8 h-[90vh] overflow-y-scroll'>
      {/* The wrapper div containing both responsive components */}
      <div className=''>
        {" "}
        <h1 className='font-bold text-black text-3xl'>Vest Tokens</h1>
        <p className='text-black/60'>Create and manage token vesting schedules</p>
      </div>
      <div className='flex flex-col gap-10 max-w-6xl'>
        {/* Component 1: Vesting Creator Form */}
        <VestingCreator />

        {/* Component 2: Vesting Schedule Table */}
        <VestingTable />
      </div>
    </div>
  );
};
