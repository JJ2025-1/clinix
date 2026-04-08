'use client';

import { useState, useEffect } from 'react';
import { HospitalSystem } from '@/lib/hospitalSystem';
import { 
  Users, 
  PlusCircle, 
  Search, 
  BarChart3, 
  Stethoscope, 
  Calendar, 
  Phone, 
  UserPlus, 
  Activity,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ClinicDashboard() {
  const [system, setSystem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Patient Registration State
  const [regData, setRegData] = useState({ name: '', age: '', phone: '' });
  
  // Visit State
  const [visitData, setVisitData] = useState({ patientId: '', diagnosis: '', prescription: '' });
  
  // Search State
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Reports/Stats
  const [stats, setStats] = useState({ totalPatients: 0, totalVisits: 0, monthlyVisits: 0 });
  const [frequentVisitors, setFrequentVisitors] = useState([]);

  useEffect(() => {
    const hs = new HospitalSystem();
    setSystem(hs);
    updateStats(hs);
  }, []);

  const updateStats = (hs) => {
    setStats({
      totalPatients: hs.patients.length,
      totalVisits: hs.visits.length,
      monthlyVisits: hs.getTotalVisitsThisMonth()
    });
    setFrequentVisitors(hs.getFrequentVisitors(2));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    try {
      const p = system.registerPatient(regData.name, regData.age, regData.phone);
      showMessage('success', `Patient registered with ID: ${p.id}`);
      setRegData({ name: '', age: '', phone: '' });
      updateStats(system);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleAddVisit = (e) => {
    e.preventDefault();
    try {
      system.addVisit(visitData.patientId, new Date().toISOString(), visitData.diagnosis, visitData.prescription);
      showMessage('success', 'Visit record saved successfully!');
      setVisitData({ patientId: '', diagnosis: '', prescription: '' });
      updateStats(system);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const result = system.searchPatient(searchId);
    if (result) {
      setSearchResult(result);
      showMessage('success', 'Patient history loaded.');
    } else {
      setSearchResult(null);
      showMessage('error', 'Patient ID not found.');
    }
  };

  if (!system) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Stethoscope size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-card border-r border-border p-6 flex flex-col gap-8 shadow-sm lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/30">
            <Stethoscope size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Clinic<span className="text-primary">Core</span></h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={20} />} label="Overview" />
          <NavItem active={activeTab === 'register'} onClick={() => setActiveTab('register')} icon={<UserPlus size={20} />} label="Register Patient" />
          <NavItem active={activeTab === 'visit'} onClick={() => setActiveTab('visit')} icon={<PlusCircle size={20} />} label="Record Visit" />
          <NavItem active={activeTab === 'search'} onClick={() => setActiveTab('search')} icon={<Search size={20} />} label="History Search" />
          <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={20} />} label="Analytics" />
        </nav>

        <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1">Clinic Status</p>
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold capitalize">{activeTab} Dashboard</h2>
            <p className="text-secondary text-sm mt-1">Welcome back to your clinic management hub.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold">
                  DR
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-secondary">3 active staff</span>
          </div>
        </header>

        {/* Alerts / Toasts */}
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mb-6 p-4 rounded-xl border flex items-center gap-3",
                message.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" : "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
              )}
            >
              {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="font-medium text-sm">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Users className="text-blue-500" />} label="Total Patients" value={stats.totalPatients} trend="+4%" />
                <StatCard icon={<ClipboardList className="text-emerald-500" />} label="Total Visits" value={stats.totalVisits} trend="+12%" />
                <StatCard icon={<TrendingUp className="text-primary" />} label="Monthly Visits" value={stats.monthlyVisits} trend="+2%" />
              </div>

              {/* Recent Activity Table */}
              <section className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Clock size={20} className="text-primary" /> Recent Patients</h3>
                  <button onClick={() => setActiveTab('register')} className="text-sm font-semibold text-primary hover:underline">Register New</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary/5 text-secondary text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {system.patients.slice(-5).reverse().map(p => (
                        <tr key={p.id} className="hover:bg-secondary/5 transition-colors group">
                          <td className="px-6 py-4 font-mono text-sm text-primary">{p.id}</td>
                          <td className="px-6 py-4 font-medium">{p.name} <span className="text-xs text-secondary">({p.age}y)</span></td>
                          <td className="px-6 py-4 text-sm text-secondary">{p.phone}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setSearchId(p.id); setActiveTab('search'); }} className="p-2 rounded-lg bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {system.patients.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-secondary">No patients registered yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-card p-8 rounded-3xl border border-border shadow-xl shadow-primary/5">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">New Patient Intake</h3>
                  <p className="text-secondary text-sm">Please provide the patient's basic identification details.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">Full Name</label>
                    <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Johnathan Doe" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold px-1">Age</label>
                      <input type="number" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="28" value={regData.age} onChange={(e) => setRegData({...regData, age: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold px-1">Phone Number</label>
                      <input type="tel" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="+1 (555) 000-0000" value={regData.phone} onChange={(e) => setRegData({...regData, phone: e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <UserPlus size={24} /> Register Patient
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'visit' && (
            <motion.div 
              key="visit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-card p-8 rounded-3xl border border-border shadow-xl shadow-primary/5">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Patient Consult Record</h3>
                  <p className="text-secondary text-sm">Log diagnostic notes and prescriptions for today's visit.</p>
                </div>
                <form onSubmit={handleAddVisit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">Select Patient</label>
                    <select className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" value={visitData.patientId} onChange={(e) => setVisitData({...visitData, patientId: e.target.value})} required>
                      <option value="">-- Choose Patient --</option>
                      {system.patients.map(p => (
                        <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">Diagnosis</label>
                    <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Mild Influenza" value={visitData.diagnosis} onChange={(e) => setVisitData({...visitData, diagnosis: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">Prescription Notes</label>
                    <textarea rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="e.g. 500mg Paracetamol, 2x daily..." value={visitData.prescription} onChange={(e) => setVisitData({...visitData, prescription: e.target.value})} required />
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <PlusCircle size={24} /> Save Visit Record
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                    <input type="text" className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg" placeholder="Search Patient ID (e.g. P101)" value={searchId} onChange={(e) => setSearchId(e.target.value.toUpperCase())} required />
                  </div>
                  <button type="submit" className="bg-primary text-white px-8 rounded-2xl font-bold hover:bg-primary/90 transition-all">Search</button>
                </form>
              </div>

              {searchResult && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card p-6 rounded-3xl border border-border">
                      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 mx-auto">
                        <Users size={40} />
                      </div>
                      <h4 className="text-xl font-bold text-center">{searchResult.patient.name}</h4>
                      <p className="text-center text-secondary font-mono text-sm mb-6">{searchResult.patient.id}</p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between p-3 bg-secondary/5 rounded-xl">
                          <span className="text-secondary text-sm flex items-center gap-2"><Calendar size={14} /> Age</span>
                          <span className="font-bold">{searchResult.patient.age} years</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary/5 rounded-xl">
                          <span className="text-secondary text-sm flex items-center gap-2"><Phone size={14} /> Phone</span>
                          <span className="font-bold">{searchResult.patient.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="bg-card rounded-3xl border border-border overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold flex items-center gap-2"><ClipboardList size={20} className="text-primary" /> Full Visit History</h3>
                      </div>
                      <div className="p-6">
                        {searchResult.history.length > 0 ? (
                          <div className="space-y-4">
                            {searchResult.history.reverse().map((v, i) => (
                              <div key={i} className="p-4 rounded-2xl border border-border hover:border-primary/30 transition-all bg-secondary/5 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-primary uppercase">{new Date(v.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                  <span className="text-[10px] text-secondary font-mono">{new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <h5 className="font-bold text-lg mb-1">{v.diagnosis}</h5>
                                <p className="text-secondary text-sm italic">Rx: {v.prescription}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <AlertCircle size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary">No recorded visits for this patient.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Monthly Growth Card */}
                <div className="bg-card p-8 rounded-3xl border border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp size={120} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Clinic Activity</h3>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-5xl font-extrabold text-primary">{stats.monthlyVisits}</span>
                    <span className="text-secondary font-medium pb-2 text-sm uppercase tracking-wider">Visits this month</span>
                  </div>
                  <div className="w-full bg-secondary/10 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.monthlyVisits / 50) * 100, 100)}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <p className="mt-4 text-xs text-secondary italic">Target: 50 visits/month based on current clinic capacity.</p>
                </div>

                {/* Frequent Visitors Card */}
                <div className="bg-card p-8 rounded-3xl border border-border">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart3 size={24} className="text-emerald-500" /> Frequent Visitors</h3>
                  {frequentVisitors.length > 0 ? (
                    <div className="space-y-4">
                      {frequentVisitors.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs">
                              {v.visitCount}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{v.name}</p>
                              <p className="text-[10px] text-secondary font-mono">{v.id}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">High Priority</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-secondary text-sm">
                      No patients meet the frequent visitor criteria (&gt;2 visits).
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components for better organization
function NavItem({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-sm",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/25" 
          : "text-secondary hover:bg-secondary/10 hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-secondary/5 rounded-2xl">
          {icon}
        </div>
        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-secondary uppercase tracking-wider">{label}</p>
        <p className="text-4xl font-black mt-1">{value}</p>
      </div>
    </div>
  );
}
