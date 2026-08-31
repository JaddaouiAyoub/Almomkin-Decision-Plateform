"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X, Activity } from "lucide-react";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            ALMOMKIN
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer Container */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform lg:transform-none lg:opacity-100 lg:relative lg:flex lg:z-0 border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Close Button inside drawer header */}
        <div className="lg:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Render Sidebar component passing onClose for automatically closing drawer on navigations */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
