import React from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className='relative flex items-center bg-white rounded-lg w-[50%]'>
      <Search className='left-3 absolute w-5 h-5 text-gray-400' />
      <input
        type='text'
        placeholder='Search'
        className='bg-white p-2 pl-10 rounded-lg focus:outline-blue-800 ring-1 ring-gray-500 w-full text-gray-400'
      />
    </div>
  );
};

export default SearchBar;
