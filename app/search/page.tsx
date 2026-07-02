import React from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="text-slate-300">Loading search...</div>}>
      <SearchClient />
    </React.Suspense>
  );
}
