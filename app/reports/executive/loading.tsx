
import React from 'react';

export default function ExecutiveReportLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-32 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* AI Analysis Skeleton */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-8 mb-8 animate-pulse relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-200"></div>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-8 h-8 bg-purple-100 rounded-lg"></div>
           <div className="h-6 w-64 bg-purple-100 rounded"></div>
        </div>
        <div className="space-y-3">
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
            <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] animate-pulse">
            <div className="h-6 w-48 bg-slate-200 rounded mb-8"></div>
            <div className="h-64 bg-slate-100 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-8"></div>
            <div className="h-64 w-64 mx-auto bg-slate-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
