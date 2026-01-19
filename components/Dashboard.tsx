
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTechSummary } from '../services/geminiService';
import { ICONS } from '../constants';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<string>("Initializing tech hub analysis...");
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await getTechSummary(0);
      setSummary(res || "Operational hub for Jersey Bee technical infrastructure.");
      setLoadingSummary(false);
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Systems Overview</h1>
        <p className="text-gray-600 mb-6">Welcome to the Jersey Bee Technical Operations Dashboard.</p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start space-x-3">
            <div className="mt-1 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider">AI Insights</h3>
              <p className="text-yellow-900 mt-1 italic">
                {loadingSummary ? "Generating insight..." : `"${summary}"`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Quick View */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Active Projects', value: '0', icon: <ICONS.Project />, color: 'bg-blue-500' },
          { label: 'System Health', value: '100%', icon: <ICONS.Status />, color: 'bg-green-500' },
          { label: 'Users', value: '5', icon: <ICONS.User />, color: 'bg-yellow-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Empty State / Coming Soon */}
      <section className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
            <ICONS.Project />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Phase 1 Initialized</h2>
          <p className="text-gray-600 mb-8">
            The infrastructure shell is ready. Authenticated team members can now access the dash. 
            Phase 2 will integrate the Airtable Project Registry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/projects" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95">
              Add First Project
            </Link>
            <a href="https://github.com/comminfo/tech-dashboard" target="_blank" className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              View Repo
            </a>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
          Implementation Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { phase: '1', title: 'Auth & Shell', status: 'Completed', detail: 'Cloudflare Access & Layout' },
            { phase: '2', title: 'Registry', status: 'Pending', detail: 'Airtable Integration' },
            { phase: '3', title: 'Monitoring', status: 'Pending', detail: 'Uptime & ULR Checks' },
            { phase: '4', title: 'Controls', status: 'Pending', detail: 'Trigger Deploys & Logs' },
          ].map((item) => (
            <div key={item.phase} className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Phase {item.phase}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
