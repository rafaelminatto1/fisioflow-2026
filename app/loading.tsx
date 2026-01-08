import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-6 md:p-8 max-w-7xl mx-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                <div>
                    <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                    <div className="h-6 w-48 bg-slate-300 rounded"></div>
                </div>
            </div>
            <div className="h-14 w-full md:w-96 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-slate-200 rounded-full"></div>)}
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 p-4">
             <div className="flex justify-between items-start mb-4">
                 <div className="h-4 w-24 bg-slate-100 rounded"></div>
                 <div className="h-5 w-5 bg-slate-100 rounded-full"></div>
             </div>
             <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
             <div className="h-4 w-12 bg-slate-100 rounded"></div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px] bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 w-48 bg-slate-100 rounded mb-8"></div>
            <div className="h-64 bg-slate-50 rounded"></div>
        </div>
        <div className="lg:col-span-1 h-[350px] bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 w-32 bg-slate-100 rounded mb-8"></div>
            <div className="space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-slate-50 rounded"></div>)}
            </div>
        </div>
      </section>

      {/* Schedule Skeleton */}
      <section className="h-96 bg-white rounded-xl border border-slate-200 p-6">
         <div className="h-8 w-48 bg-slate-100 rounded mb-6"></div>
         <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded"></div>)}
         </div>
      </section>
    </div>
  );
}