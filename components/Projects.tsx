
import React from 'react';
import { ICONS } from '../constants';

const Projects: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Central registry of all technical assets.</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Project
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-12 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ICONS.Project />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registry Offline</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            The project registry is currently awaiting the Phase 2 Airtable integration. 
            Once connected, projects will automatically populate here.
          </p>
          <div className="inline-flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse ml-2"></span>
            <span className="text-sm font-medium text-gray-600 pr-4">Waiting for Airtable Webhook...</span>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Registry Plan</h3>
          <ul className="space-y-3">
            {[
              'Connect to Jersey Bee Tech Operations Airtable base',
              'Fetch project URLs and health endpoints',
              'Categorize by Type (Worker, Pages, Automation)',
              'Synchronize health status every 5 minutes'
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </div>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Projects;
