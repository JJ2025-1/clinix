'use client';

import React, { useState, useEffect } from 'react';
import { HospitalSystem } from '@/lib/hospitalSystem';
import {
  Home, Users, FileText, BarChart3, Search, Bell, User, Settings, X, Stethoscope, MoreHorizontal, Activity, TrendingUp, LogOut, ChevronRight, Plus, Phone, Calendar, ArrowRight, CheckCircle2, Clock, Check, Layers
} from 'lucide-react';

export default function ClinicApp() {
  const [system, setSystem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState({ name: '', id: '', phone: '' });
  const [activeTab, setActiveTab] = useState('home'); 
  const [queueTab, setQueueTab] = useState('upcoming');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [servingPatient, setServingPatient] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hs = new HospitalSystem();
    setSystem(hs);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const savedDoctor = localStorage.getItem('clinix_doctor');
    if (savedDoctor) {
      setDoctorProfile(JSON.parse(savedDoctor));
      setIsLoggedIn(true);
    }
    const savedDarkMode = localStorage.getItem('clinix_dark_mode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add('dark');
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clinix_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clinix_dark_mode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const toggleMenu = (menu) => setActiveMenu(activeMenu === menu ? null : menu);
  const refreshData = () => setSystem(Object.assign(Object.create(Object.getPrototypeOf(system)), system));

  const handleCancel = (patientId) => {
    if (system.cancelPatient(patientId)) {
      setMessage({ type: 'success', text: 'Patient moved to missed list' });
      refreshData();
    }
  };

  const getWaitingPatients = () => {
    if (!system) return [];
    const servingId = servingPatient ? servingPatient.id : null;
    const completedIds = system.visits.map(v => v.patientId);
    return system.patients.filter(p => p.id !== servingId && !completedIds.includes(p.id));
  };

  const startConsultation = () => {
    const waiting = getWaitingPatients();
    if (waiting.length === 0) {
      setMessage({ type: 'error', text: 'No patients in queue' });
      return;
    }
    setServingPatient(waiting[0]);
    setMessage({ type: 'success', text: `Consultation started with ${waiting[0].name}` });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profile = {
      name: formData.get('doctorName'),
      id: formData.get('doctorId'),
      phone: formData.get('doctorPhone')
    };
    setDoctorProfile(profile);
    setIsLoggedIn(true);
    localStorage.setItem('clinix_doctor', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('clinix_doctor');
    setDoctorProfile({ name: '', id: '', phone: '' });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const p = system.registerPatient(formData.get('name'), formData.get('age'), formData.get('phone'));
      setMessage({ type: 'success', text: `Patient ${p.name} registered (UID: ${p.id})` });
      setActiveTab('home');
      refreshData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCompleteConsultation = (e) => {
    e.preventDefault();
    if (!servingPatient) return;
    const formData = new FormData(e.target);
    try {
      system.addVisit(servingPatient.id, new Date().toISOString(), formData.get('diag'), formData.get('rx'));
      setServingPatient(null);
      setShowVisitModal(false);
      setMessage({ type: 'success', text: 'EMR record finalized' });
      refreshData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const result = system.searchPatient(searchId.toUpperCase());
    if (result) {
      setSearchResult(result);
      setActiveTab('history');
    } else {
      setMessage({ type: 'error', text: 'UID not found' });
    }
  };

  const handlePrint = (patient, visit) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>EMR Statement - ${patient.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #1a4fbc; padding-bottom: 20px; margin-bottom: 30px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .diagnosis { margin-bottom: 30px; font-size: 1.2em; }
            .prescription { padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #1a4fbc; }
            .footer { margin-top: 50px; text-align: right; font-weight: bold; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header"><h1 style="color:#1a4fbc">CLINIX</h1><p>Electronic Medical Record (EMR)</p></div>
          <div class="meta">
            <div><p><b>Patient:</b> ${patient.name}</p><p><b>UID:</b> ${patient.id}</p></div>
            <div><p><b>Clinician:</b> Dr. ${doctorProfile.name}</p><p><b>Date:</b> ${new Date(visit.date).toLocaleString('en-IN')}</p></div>
          </div>
          <div class="diagnosis"><b>Clinical Impression:</b><br/> ${visit.diagnosis}</div>
          <div class="prescription"><b>Prescription:</b><br/> ${visit.prescription}</div>
          <div class="footer">Visit Fee: ₹500.00</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!system) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#1a4fbc] font-sans selection:bg-orange-200">
        <div className="flex-1 flex flex-col justify-center px-10 md:px-24 py-16 text-white">
          <div className="mb-12">
            <div className="text-4xl font-black tracking-tighter mb-16 flex items-center gap-2">
               <Activity size={32} className="text-orange-400" /> Clinix
            </div>
            <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              Run Your Clinic <br />
              <span className="text-[#ff782d]">Smarter.</span> Not Harder.
            </h1>
            <p className="text-xl md:text-2xl text-blue-50/80 max-w-xl leading-relaxed mb-12 font-medium">
              Clinix is the all-in-one powered clinic management system that handles appointments, billing, EMR, prescriptions and more.
            </p>
            <div className="space-y-6 mb-16">
              <CheckItem text="Securely store and access patient history" />
              <CheckItem text="Digital prescriptions and lab integration" />
              <CheckItem text="Enterprise-grade data encryption" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[580px] p-10 md:p-16 text-slate-900 z-10 relative">
            <div className="mb-12 text-center md:text-left">
              <h3 className="text-4xl font-bold mb-4 tracking-tight">Clinician Portal</h3>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">Fill in the details to access your workspace.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800">Full Name *</label>
                <input name="doctorName" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-medium" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800">Doc ID *</label>
                  <input name="doctorId" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-medium" placeholder="DOC-123" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800">Phone *</label>
                  <input name="doctorPhone" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-lg font-medium" placeholder="+91 98765 43210" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#ff782d] text-white py-6 rounded-[20px] font-bold text-xl shadow-lg hover:bg-[#e66a25] transition-all flex items-center justify-center gap-3">
                Enter Dashboard <ArrowRight size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const waitingPatients = getWaitingPatients();
  const frequentVisitors = system.getFrequentVisitors(1);

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0f1e] text-slate-200' : 'bg-[#f8faff] text-slate-900'}`}>
      
      {/* Sidebar - Pro Blue */}
      <aside className="hidden md:flex w-[88px] bg-[#1a4fbc] dark:bg-[#050810] flex-col items-center py-10 shrink-0 z-20 shadow-xl">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-16 shadow-lg rotate-[-5deg]">
          <Activity size={28} className="text-[#1a4fbc]" />
        </div>
        <div className="flex flex-col gap-10 w-full items-center">
          <SideIcon icon={<Home size={24} />} active={activeTab === 'home'} label="EMR" onClick={() => setActiveTab('home')} />
          <SideIcon icon={<Plus size={24} />} active={activeTab === 'register'} label="Register" onClick={() => setActiveTab('register')} />
          <SideIcon icon={<FileText size={24} />} active={activeTab === 'history'} label="History" onClick={() => setActiveTab('history')} />
          <SideIcon icon={<BarChart3 size={24} />} active={activeTab === 'reports'} label="Reports" onClick={() => setActiveTab('reports')} />
        </div>
        <button onClick={handleLogout} className="mt-auto p-4 text-blue-200 hover:text-white transition-colors"><LogOut size={24} /></button>
      </aside>

      {/* Mobile Navigation */}
      <aside className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-[#0a0f1e] border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50 px-2 shadow-2xl transition-colors">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><Home size={22} /> EMR</button>
        <button onClick={() => setActiveTab('register')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'register' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><Plus size={22} /> Add</button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'history' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><FileText size={22} /> Records</button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'reports' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><BarChart3 size={22} /> Stats</button>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-24 md:pb-0 relative">
        
        {/* Header - Brand Header */}
        <div className="bg-[#1a4fbc] dark:bg-[#050810] px-6 md:px-12 py-6 shrink-0 z-10 sticky top-0 transition-colors shadow-lg text-white">
          <header className="flex justify-between items-center max-w-[1600px] mx-auto w-full">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">Clinix</h1>
              <p className="text-[10px] md:text-xs text-blue-100 font-bold uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Dr. {doctorProfile.name} • Electronic Medical Records
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <form onSubmit={handleSearch} className="relative hidden lg:block w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={18} />
                <input 
                  type="text" placeholder="Authorized Patient Search..." value={searchId} onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder:text-blue-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10 transition-all font-medium backdrop-blur-md"
                />
              </form>
              <div className="flex items-center gap-3">
                <HeaderAction icon={<Bell size={20} />} onClick={() => toggleMenu('notifications')} active={activeMenu === 'notifications'} />
                <HeaderAction icon={<Settings size={20} />} onClick={() => toggleMenu('settings')} active={activeMenu === 'settings'} />
                <div className="relative">
                  <button onClick={() => toggleMenu('profile')} className="w-10 h-10 bg-[#ff782d] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all">
                    {doctorProfile.name[0]}
                  </button>
                  {activeMenu === 'profile' && (
                    <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-[#0a0f1e] border border-blue-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-[100] text-slate-900 dark:text-white animate-in slide-in-from-top-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Clinician Profile</h4>
                       <div className="space-y-5">
                          <ProfileRow label="Authorization" value="Senior Consultant" />
                          <ProfileRow label="Station UID" value={doctorProfile.id} />
                          <ProfileRow label="Secure Contact" value={doctorProfile.phone} />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Content Area - Balanced Layout */}
        <div className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full flex flex-col xl:flex-row gap-10 items-start">
          
          <div className="flex-1 w-full space-y-10">
            
            {activeTab === 'home' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Live Triage" value={waitingPatients.length} subLabel="Active queue" icon={<Users size={24} className="text-[#1a4fbc]" />} />
                  <StatCard label="Monthly EMR" value={system.getTotalVisitsThisMonth()} subLabel="Records created" icon={<Layers size={24} className="text-emerald-500" />} />
                  <div className="bg-gradient-to-br from-[#1a4fbc] to-[#143d9a] text-white rounded-[28px] p-6 shadow-xl flex flex-col justify-between overflow-hidden relative group">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">EMR Station Time</p>
                    <p className="text-3xl font-black mt-2 tracking-tight">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    <p className="text-[10px] font-bold text-blue-200 mt-2">{currentTime.toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a4fbc]/50 mb-5 flex items-center gap-3 ml-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#1a4fbc]"></div> Active Station Console
                  </h3>
                  <DoctorCard 
                    name={doctorProfile.name} isServing={!!servingPatient} patient={servingPatient} onStart={startConsultation} onComplete={() => setShowVisitModal(true)} darkMode={darkMode}
                  />
                </section>

                <section className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a4fbc]/50 flex items-center gap-3 ml-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Electronic Triage List
                    </h3>
                    <div className="flex bg-blue-50/50 dark:bg-[#0a0f1e] rounded-xl p-1.5 shadow-sm border border-blue-100 dark:border-slate-800">
                      <TabBtn active={queueTab === 'upcoming'} onClick={() => setQueueTab('upcoming')}>Active ({waitingPatients.length})</TabBtn>
                      <TabBtn active={queueTab === 'missed'} onClick={() => setQueueTab('missed')}>No Show ({system.missed.length})</TabBtn>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(queueTab === 'upcoming' ? waitingPatients : system.missed).map((p, i) => (
                      <QueueItem key={p.id} patient={p} index={i} qNum={101 + i} onCancel={() => handleCancel(p.id)} isMissed={queueTab === 'missed'} darkMode={darkMode} />
                    ))}
                    {((queueTab === 'upcoming' && waitingPatients.length === 0) || (queueTab === 'missed' && system.missed.length === 0)) && (
                      <div className="bg-white dark:bg-[#0a0f1e] border-2 border-dashed border-blue-100 dark:border-slate-800 rounded-[28px] py-24 text-center">
                         <p className="text-blue-300 dark:text-slate-600 font-bold uppercase tracking-widest text-sm">No electronic records found.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'register' && (
              <section className="bg-white dark:bg-[#0a0f1e] rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-xl max-w-xl mx-auto w-full overflow-hidden mt-10">
                <div className="bg-gradient-to-r from-[#1a4fbc] to-[#143d9a] p-10 text-white text-center">
                   <h3 className="text-3xl font-black tracking-tight">Record Initiation</h3>
                   <p className="text-blue-100 font-medium mt-2">Initialize new secure medical history profile.</p>
                </div>
                <form onSubmit={handleRegister} className="p-10 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest ml-1">Patient Identity</label>
                      <input name="name" required className="w-full bg-blue-50/30 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-xl px-6 py-5 outline-none focus:border-[#1a4fbc] focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-lg text-slate-900 dark:text-white" placeholder="Patient's Full Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest ml-1">Legal Age</label>
                        <input name="age" type="number" required className="w-full bg-blue-50/30 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900 dark:text-white" placeholder="Age" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest ml-1">Mobile Contact</label>
                        <input name="phone" required className="w-full bg-blue-50/30 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900 dark:text-white" placeholder="Phone" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#ff782d] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-orange-500/20 hover:bg-[#e66a25] transition-all active:scale-95">Assign Medical UID</button>
                </form>
              </section>
            )}

            {activeTab === 'history' && (
              <section className="bg-white dark:bg-[#0a0f1e] rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-xl overflow-hidden min-h-[500px]">
                {searchResult ? (
                  <div className="p-8">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b dark:border-slate-800">
                      <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-3xl text-[#1a4fbc] shadow-inner">{searchResult.patient.name[0]}</div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{searchResult.patient.name}</h3>
                        <p className="text-[#1a4fbc] font-black mt-1 text-sm uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md inline-block">{searchResult.patient.id}</p>
                      </div>
                      <button onClick={() => setSearchResult(null)} className="ml-auto p-2 text-slate-400 hover:text-rose-500"><X size={24} /></button>
                    </div>
                    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                      {searchResult.history.length > 0 ? [...searchResult.history].reverse().map((v, i) => (
                        <HistoryItem key={i} visit={v} />
                      )) : <p className="text-center text-slate-400 font-bold py-20 italic uppercase tracking-widest text-xs">No clinical history recorded.</p>}
                    </div>
                  </div>
                ) : (
                  <div className="py-40 text-center">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1a4fbc] shadow-inner"><Search size={48} /></div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Record Intelligence</h3>
                    <p className="text-slate-500 font-medium mt-2">Authorize record access by entering a valid UID.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard title="EMR Record Pulse" value={system.getTotalVisitsThisMonth()} trend="+12%" description="Aggregate monthly throughput of verified electronic records." icon={<Activity size={28} className="text-[#1a4fbc]" />} />
                <div className="bg-white dark:bg-[#0a0f1e] p-8 rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-xl">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#ff782d]" /> Frequent Cohorts
                  </h3>
                  <div className="space-y-3">
                    {frequentVisitors.length > 0 ? frequentVisitors.map(v => (
                      <div key={v.id} className="flex justify-between items-center bg-blue-50/30 dark:bg-[#050810] p-4 rounded-xl text-slate-900 dark:text-white border border-blue-100/50 dark:border-slate-800">
                        <span className="font-black text-sm">{v.name}</span>
                        <span className="text-[10px] font-black bg-white dark:bg-slate-800 text-[#1a4fbc] px-3 py-1.5 rounded-lg shadow-sm border border-blue-50 uppercase">Verified Patient</span>
                      </div>
                    )) : <p className="text-slate-400 italic text-center py-10 uppercase tracking-widest text-[10px]">Statistical data pending.</p>}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Billing Side - Constrained width */}
          <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#ff782d] flex items-center gap-3 ml-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#ff782d] animate-pulse"></div> Station Billing
            </h3>
            <div className="space-y-5">
              {system.visits.slice(-5).reverse().map((v, i) => (
                <CheckoutCard key={i} visit={v} patient={system.patients.find(p => p.id === v.patientId)} onPrint={handlePrint} doctorName={doctorProfile.name} darkMode={darkMode} />
              ))}
              {system.visits.length === 0 && (
                 <div className="bg-white dark:bg-[#0a0f1e] border border-blue-100 dark:border-slate-800 rounded-[28px] p-16 text-center shadow-lg">
                   <FileText size={32} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No pending transactions</p>
                 </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Modal: Record Finalization */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0a0f1e] rounded-[32px] w-full max-w-lg shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95">
             <div className="p-8 bg-[#1a4fbc] text-white flex justify-between items-center">
                <div><h3 className="text-xl font-black tracking-tight uppercase">EMR Session Finalization</h3><p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Authorized Medical Signature Required</p></div>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleCompleteConsultation} className="p-8 space-y-6">
               <div className="space-y-5">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Impression</label><input name="diag" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 outline-none focus:border-[#1a4fbc] font-bold text-sm text-slate-900 dark:text-white" placeholder="Enter diagnosis..." /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pharmacotherapy directive</label><textarea name="rx" required rows="4" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 outline-none resize-none font-bold text-sm text-slate-900 dark:text-white" placeholder="Enter dosage, frequency..." /></div>
               </div>
               <button className="w-full bg-[#ff782d] text-white py-5 rounded-xl font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Sign & Finalize Record</button>
             </form>
           </div>
        </div>
      )}

      {/* Toast */}
      {message && (
        <div className={`fixed bottom-28 md:bottom-12 right-1/2 translate-x-1/2 md:translate-x-0 md:right-12 px-8 py-4 rounded-2xl shadow-2xl z-[200] flex items-center gap-4 text-white font-black animate-in slide-in-from-right backdrop-blur-xl border border-white/20 ${message.type === 'error' ? 'bg-rose-600/95' : 'bg-slate-900/95'}`}>
           <CheckCircle2 size={20} /> <span className="text-sm uppercase tracking-tight">{message.text}</span>
        </div>
      )}
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/10"><Check size={18} strokeWidth={4} className="text-white" /></div>
      <p className="text-xl font-bold text-blue-50">{text}</p>
    </div>
  );
}

function SideIcon({ icon, active, onClick, mobile, label }) {
  return (
    <button onClick={onClick} className={`relative p-4 rounded-xl transition-all ${active ? 'bg-white text-[#1a4fbc] shadow-xl scale-110' : 'text-blue-100/60 hover:text-white hover:bg-white/5'}`} title={label}>{icon}</button>
  );
}

function HeaderAction({ icon, onClick, active }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl transition-all relative ${active ? 'bg-white/20 text-white shadow-inner' : 'text-blue-100/70 hover:text-white'}`}>{icon}</button>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-800 dark:text-white leading-none">{value}</span>
    </div>
  );
}

function StatCard({ label, value, subLabel, icon }) {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] p-6 rounded-[28px] border border-blue-50 dark:border-slate-800 shadow-xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20 shadow-inner`}>{icon}</div>
       <div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">{value}</p>
         <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-2">{subLabel}</p>
       </div>
    </div>
  );
}

function DoctorCard({ name, isServing, patient, onStart, onComplete, darkMode }) {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] rounded-[28px] p-8 border border-blue-100 dark:border-slate-800 shadow-xl flex flex-col lg:flex-row gap-8 items-center text-slate-900 dark:text-white relative overflow-hidden transition-all">
      <div className={`absolute left-0 top-0 w-1.5 h-full ${isServing ? 'bg-emerald-500' : 'bg-[#1a4fbc]'}`}></div>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-xl flex items-center justify-center font-black text-3xl text-[#1a4fbc]">{name[0]}</div>
        <div>
          <h4 className="text-2xl font-black tracking-tight leading-none uppercase">{name}</h4>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Verified Clinician • EMR AUTH</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mt-5 text-[9px] font-black border-2 ${isServing ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-[#1a4fbc] border-blue-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isServing ? 'bg-emerald-500 animate-pulse' : 'bg-[#1a4fbc]'}`}></span> {isServing ? 'EMR SESSION ACTIVE' : 'SYSTEM AVAILABLE'}
          </div>
        </div>
      </div>
      <div className="flex-1 w-full lg:max-w-xs">
        {isServing && patient ? (
          <div className="bg-blue-50/30 dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-inner">
            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2">Authenticated Patient</p>
            <p className="text-lg font-black leading-none">{patient.name}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-tighter">{patient.id}</p>
          </div>
        ) : <p className="text-xs text-slate-400 italic font-bold uppercase tracking-widest ml-4">Workstation Idle</p>}
      </div>
      <div className="flex flex-col gap-3 w-full lg:w-auto">
        <button onClick={isServing ? onComplete : onStart} className={`px-10 py-4 rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 ${isServing ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-[#1a4fbc] text-white shadow-blue-500/20'}`}>
          {isServing ? 'FINALIZE RECORD' : 'INITIATE SESSION'}
        </button>
        <button className="text-[9px] font-black text-slate-400 hover:text-[#1a4fbc] transition-colors uppercase tracking-[0.2em] text-center">Settings <ChevronRight size={12} className="inline ml-1"/></button>
      </div>
    </div>
  );
}

function QueueItem({ patient, index, qNum, onCancel, isMissed, darkMode }) {
  return (
    <div className={`bg-white dark:bg-[#0a0f1e] border border-blue-50 dark:border-slate-800 p-5 rounded-[28px] flex items-center justify-between group transition-all hover:border-[#1a4fbc]/30 hover:shadow-xl ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-lg text-[#1a4fbc]/30 group-hover:text-[#1a4fbc] transition-all shadow-inner">{index + 1}</div>
        <div>
          <div className="flex items-center gap-3">
            <p className="font-black text-lg text-slate-900 dark:text-white leading-none">{patient.name}</p>
            <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-900/30 text-[#1a4fbc] px-2 py-1 rounded-md uppercase tracking-tighter leading-none border border-blue-100/50">{patient.id}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{patient.age} Yrs • {patient.phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden sm:block">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">REF ID</p>
           <p className="text-base font-black text-slate-900 dark:text-white mt-1 leading-none">#{qNum}</p>
        </div>
        {!isMissed ? <button onClick={onCancel} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"><X size={20} /></button> : <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-[9px] font-black rounded-lg uppercase border border-rose-100 dark:border-rose-900/30 tracking-widest">No Show</div>}
      </div>
    </div>
  );
}

function HistoryItem({ visit }) {
  return (
    <div className="relative pl-12 pb-10 group last:pb-0">
      <div className="absolute left-0 top-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-100 dark:border-slate-700 flex items-center justify-center z-10 text-[#1a4fbc] group-hover:scale-110 transition-all"><FileText size={16} /></div>
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-50 dark:bg-slate-800 rounded-full group-last:hidden"></div>
      <div className="bg-white dark:bg-slate-900/50 border border-blue-50 dark:border-slate-800 rounded-[28px] p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-[0.2em]">{new Date(visit.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span><span className="text-[10px] font-black text-slate-300 uppercase leading-none">{new Date(visit.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <p className="text-xl font-black tracking-tight leading-none text-slate-900 dark:text-white">{visit.diagnosis}</p>
        <div className="bg-blue-50/30 dark:bg-slate-800/50 p-5 rounded-2xl border-l-[4px] border-[#1a4fbc] mt-5">
           <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Electronic Prescription</p>
           <p className="text-sm font-bold italic text-slate-700 dark:text-slate-300 leading-relaxed">"{visit.prescription}"</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, trend, description, icon }) {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] p-8 rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-xl group hover:translate-y-[-4px] transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="w-14 h-14 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#1a4fbc] group-hover:scale-110 transition-all shadow-inner">{icon}</div>
        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border-2 border-emerald-100 leading-none">{trend}</span>
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <div className="text-6xl font-black mt-3 tracking-tighter leading-none text-slate-900 dark:text-white">{value}</div>
      <p className="text-xs text-slate-500 mt-6 leading-relaxed font-medium uppercase tracking-tight">{description}</p>
    </div>
  );
}

function CheckoutCard({ visit, patient, onPrint, doctorName, darkMode }) {
  return (
    <div className={`bg-white dark:bg-[#0a0f1e] rounded-[28px] p-6 border border-blue-100 dark:border-slate-800 shadow-xl transition-all hover:shadow-2xl animate-in slide-in-from-right-10 duration-500 ${darkMode ? 'dark' : ''} text-slate-900 dark:text-white`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a4fbc] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shrink-0">{patient?.name?.[0] || 'P'}</div>
          <div><p className="text-base font-black leading-none truncate">{patient?.name || 'UID Unknown'}</p><p className="text-[9px] text-slate-400 font-black mt-1.5 uppercase leading-none tracking-widest">{patient?.id}</p></div>
        </div>
        <button onClick={() => onPrint(patient, visit)} className="p-2.5 bg-blue-50 dark:bg-slate-800 text-[#1a4fbc] dark:text-white rounded-lg border border-blue-100 hover:scale-110 transition-all"><FileText size={18} /></button>
      </div>
      <div className="bg-blue-50/30 dark:bg-slate-900 p-4 rounded-xl mb-6 border border-blue-100/50 dark:border-slate-800">
        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1 leading-none">Diagnostic Summary</span>
        <p className="text-[11px] font-bold leading-relaxed truncate text-slate-600 dark:text-slate-300">{visit.diagnosis}</p>
      </div>
      <div className="flex items-center justify-between pt-5 border-t-2 border-dashed border-blue-50 dark:border-slate-800">
        <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Record Fee</p><p className="text-xl font-black text-[#1a4fbc] dark:text-blue-400 mt-1.5 tracking-tight leading-none">₹500.00</p></div>
        <button onClick={() => onPrint(patient, visit)} className="bg-[#ff782d] text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-orange-500/20 hover:bg-[#e66a25] active:scale-95 transition-all">FINALIZE & PRINT</button>
      </div>
    </div>
  );
}
