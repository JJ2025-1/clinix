'use client';

import React, { useState, useEffect } from 'react';
import { HospitalSystem } from '@/lib/hospitalSystem';
import {
  Home, Users, FileText, BarChart3, Search, Bell, User, Settings, X, Stethoscope, MoreHorizontal, Activity, TrendingUp, LogOut, ChevronRight, Plus, Phone, Calendar, ArrowRight, CheckCircle2, Clock, Check
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
      setMessage({ type: 'success', text: `Patient ${p.name} registered successfully (ID: ${p.id})` });
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
      setMessage({ type: 'success', text: 'Visit recorded successfully' });
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
      setMessage({ type: 'error', text: 'Patient ID not found' });
    }
  };

  const handlePrint = (patient, visit) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription Bill - ${patient.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .diagnosis { margin-bottom: 30px; font-size: 1.2em; }
            .prescription { padding: 20px; background: #f8fafc; border-radius: 8px; font-style: italic; }
            .footer { margin-top: 50px; text-align: right; font-weight: bold; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>CLINIX</h1><p>Electronic Medical Record (EMR) - Official Statement</p></div>
          <div class="meta">
            <div><p><b>Patient:</b> ${patient.name}</p><p><b>Patient ID:</b> ${patient.id}</p></div>
            <div><p><b>Consultant:</b> Dr. ${doctorProfile.name}</p><p><b>Date:</b> ${new Date(visit.date).toLocaleString('en-IN')}</p></div>
          </div>
          <div class="diagnosis"><b>Diagnosis:</b><br/> ${visit.diagnosis}</div>
          <div class="prescription"><b>Prescription & Dosage:</b><br/> ${visit.prescription}</div>
          <div class="footer">Consultation Fee: ₹500.00</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!system) return null;

  // Redesigned Login View
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
              <CheckItem text="Personalized demo tailored to your specialty" />
              <CheckItem text="No commitment, completely free" />
              <CheckItem text="Go live in as little as 24 hours after sign up" />
            </div>
            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10 opacity-60">
               <div className="flex items-center gap-2 text-sm font-bold"><Check size={18} /> No credit card required</div>
               <div className="flex items-center gap-2 text-sm font-bold"><Check size={18} /> Setup in 24 hours</div>
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
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0f1e] text-slate-200' : 'bg-[#f0f4f9] text-slate-900'}`}>
      
      {/* Sidebar - Consistent Branding */}
      <aside className="hidden md:flex w-24 bg-[#1a4fbc] dark:bg-[#050810] flex-col items-center py-10 shrink-0 z-20 shadow-xl">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-16 shadow-lg">
          <Activity size={28} className="text-[#1a4fbc]" />
        </div>
        
        <div className="flex flex-col gap-10 w-full items-center">
          <SideIcon icon={<Home size={24} />} active={activeTab === 'home'} label="EMR" onClick={() => setActiveTab('home')} />
          <SideIcon icon={<Plus size={24} />} active={activeTab === 'register'} label="Register" onClick={() => setActiveTab('register')} />
          <SideIcon icon={<FileText size={24} />} active={activeTab === 'history'} label="History" onClick={() => setActiveTab('history')} />
          <SideIcon icon={<BarChart3 size={24} />} active={activeTab === 'reports'} label="Reports" onClick={() => setActiveTab('reports')} />
        </div>

        <button onClick={handleLogout} className="mt-auto p-4 text-blue-200 hover:text-white transition-colors">
          <LogOut size={24} />
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-[#0a0f1e] border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50 px-2 transition-colors text-[10px] font-bold shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><Home size={22} /> EMR</button>
        <button onClick={() => setActiveTab('register')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'register' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><Plus size={22} /> Add</button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'history' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><FileText size={22} /> Records</button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'reports' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><BarChart3 size={22} /> Stats</button>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-24 md:pb-0 relative">
        
        {/* Header - Brand Header */}
        <div className="bg-[#1a4fbc] dark:bg-[#050810] px-6 md:px-12 py-6 shrink-0 z-10 sticky top-0 transition-colors shadow-lg text-white">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                Clinix
              </h1>
              <p className="text-[10px] md:text-xs text-blue-100 font-bold uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span> Dr. {doctorProfile.name} • EMR Workstation
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <form onSubmit={handleSearch} className="relative hidden lg:block w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={18} />
                <input 
                  type="text" 
                  placeholder="Patient Search..." 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder:text-blue-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10 transition-all font-medium backdrop-blur-md"
                />
              </form>
              
              <div className="flex items-center gap-3">
                <HeaderAction icon={<Bell size={20} />} onClick={() => toggleMenu('notifications')} active={activeMenu === 'notifications'} />
                <HeaderAction icon={<Settings size={20} />} onClick={() => toggleMenu('settings')} active={activeMenu === 'settings'} />
                <div className="relative">
                  <button 
                    onClick={() => toggleMenu('profile')}
                    className="w-10 h-10 bg-[#ff782d] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    {doctorProfile.name[0]}
                  </button>
                  {activeMenu === 'profile' && (
                    <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-[100] text-slate-900 dark:text-white animate-in slide-in-from-top-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Medical Profile</h4>
                       <div className="space-y-5">
                          <ProfileRow label="Specialty" value="Consultant" />
                          <ProfileRow label="System ID" value={doctorProfile.id} />
                          <ProfileRow label="Contact" value={doctorProfile.phone} />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          {activeMenu === 'settings' && (
            <div className="absolute right-12 mt-4 w-72 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 z-[100] text-slate-900 dark:text-white animate-in slide-in-from-top-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Workspace Settings</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between text-xs p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors group font-bold">
                  <span>Diagnostics</span>
                  <ChevronRight size={16} />
                </button>
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between text-xs p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors font-bold"
                >
                  <span>Dark Theme</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 md:p-12 flex flex-col xl:flex-row gap-10 max-w-[1800px] mx-auto w-full">
          <div className="flex-1 flex flex-col gap-12">
            
            {activeTab === 'home' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <StatCard label="Triage Count" value={waitingPatients.length} subLabel="Active queue" icon={<Users className="text-[#1a4fbc]" />} color="blue" />
                  <StatCard label="EMR Analytics" value={system.getTotalVisitsThisMonth()} subLabel="Records this month" icon={<Activity className="text-emerald-500" />} color="emerald" />
                  <div className="bg-[#1a4fbc] text-white rounded-[32px] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Clock</p>
                    <p className="text-4xl font-black mt-3 tracking-tighter">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    <p className="text-[11px] font-bold text-blue-200 mt-3">{currentTime.toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#1a4fbc]"></div> Active Session Terminal
                  </h3>
                  <DoctorCard 
                    name={doctorProfile.name} 
                    isServing={!!servingPatient}
                    patient={servingPatient}
                    onStart={startConsultation}
                    onComplete={() => setShowVisitModal(true)}
                    darkMode={darkMode}
                  />
                </section>

                <section className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-slate-300"></div> Patient Records Queue
                    </h3>
                    <div className="flex bg-white dark:bg-[#0a0f1e] rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-800 self-start">
                      <TabBtn active={queueTab === 'upcoming'} onClick={() => setQueueTab('upcoming')}>Active Triage ({waitingPatients.length})</TabBtn>
                      <TabBtn active={queueTab === 'missed'} onClick={() => setQueueTab('missed')}>No Show ({system.missed.length})</TabBtn>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {queueTab === 'upcoming' && waitingPatients.map((p, i) => (
                      <QueueItem 
                        key={p.id} 
                        patient={p} 
                        index={i}
                        qNum={101 + system.patients.indexOf(p)} 
                        onCancel={() => handleCancel(p.id)}
                        darkMode={darkMode}
                      />
                    ))}
                    {queueTab === 'missed' && system.missed.map((p, i) => (
                      <QueueItem 
                        key={p.id} 
                        patient={p} 
                        index={i}
                        qNum={101 + i} 
                        isMissed={true}
                        darkMode={darkMode}
                      />
                    ))}
                    {((queueTab === 'upcoming' && waitingPatients.length === 0) || (queueTab === 'missed' && system.missed.length === 0)) && (
                      <div className="bg-white dark:bg-[#0a0f1e] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] py-24 text-center">
                         <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                           <Clock size={40} />
                         </div>
                         <p className="text-slate-400 font-bold text-lg">No session records found.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'register' && (
              <section className="bg-white dark:bg-[#0a0f1e] rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto w-full overflow-hidden">
                <div className="bg-[#1a4fbc] p-10 text-white text-center">
                   <h3 className="text-3xl font-black tracking-tight">Patient Registration</h3>
                   <p className="text-blue-100 font-medium mt-2">Initialize a new secure medical history profile.</p>
                </div>
                <form onSubmit={handleRegister} className="p-12 space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                      <input name="name" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900 dark:text-white" placeholder="Patient's Full Name" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                        <input name="age" type="number" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900 dark:text-white" placeholder="Age" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                        <input name="phone" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900 dark:text-white" placeholder="Phone Number" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#ff782d] text-white py-6 rounded-2xl font-black text-xl shadow-xl hover:bg-[#e66a25] transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
                    <Plus size={24} strokeWidth={3} /> Assign Medical UID
                  </button>
                </form>
              </section>
            )}

            {activeTab === 'history' && (
              <section className="bg-white dark:bg-[#0a0f1e] rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[600px]">
                {searchResult ? (
                  <div>
                    <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[#1a4fbc]/5">
                      <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-[#1a4fbc] text-white rounded-3xl flex items-center justify-center font-black text-4xl shadow-2xl">
                          {searchResult.patient.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                             <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{searchResult.patient.name}</h3>
                             <span className="bg-[#1a4fbc] text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">{searchResult.patient.id}</span>
                          </div>
                          <div className="flex items-center gap-8 mt-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
                             <span className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm"><User size={16} /> {searchResult.patient.age} Yrs</span>
                             <span className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm"><Phone size={16} /> {searchResult.patient.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSearchResult(null)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl shadow-sm transition-all text-slate-400 hover:text-rose-500"><X size={28} /></button>
                    </div>
                    <div className="p-10">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 text-center">EMR Chronological Record</h4>
                       <div className="space-y-10 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
                         {searchResult.history.length > 0 ? [...searchResult.history].reverse().map((v, i) => (
                           <HistoryItem key={i} visit={v} />
                         )) : (
                           <div className="py-32 text-center text-slate-400 font-bold italic">No EMR session history found for this UID.</div>
                         )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-48 text-center">
                    <div className="w-28 h-28 bg-blue-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#1a4fbc]">
                      <Search size={56} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Central Medical Intelligence</h3>
                    <p className="text-slate-500 text-lg max-w-md mx-auto mt-4 font-medium">Authorize profile access by entering a patient medical UID in the workspace search.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ReportCard 
                  title="Electronic Record Pulse" 
                  value={system.getTotalVisitsThisMonth()} 
                  trend="+12%" 
                  description="Monthly throughput of verified electronic medical records."
                  icon={<Activity size={32} />}
                />
                <div className="bg-white dark:bg-[#0a0f1e] p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-[#1a4fbc] shrink-0 shadow-sm"><TrendingUp size={36} /></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Frequent Cohorts</h3>
                       <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">Statistical Sample</p>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1">
                    {frequentVisitors.length > 0 ? frequentVisitors.map(v => (
                      <div key={v.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border-2 border-transparent hover:border-[#1a4fbc]/20 transition-all text-slate-900 dark:text-white">
                        <div className="flex items-center gap-5">
                          <div className="w-11 h-11 bg-[#1a4fbc] text-white rounded-xl flex items-center justify-center font-black">{v.name[0]}</div>
                          <span className="font-black text-lg">{v.name}</span>
                        </div>
                        <span className="text-[10px] font-black bg-white dark:bg-slate-800 text-[#1a4fbc] dark:text-blue-400 px-4 py-2 rounded-xl shadow-sm uppercase">Recurrent EMR</span>
                      </div>
                    )) : (
                      <div className="h-full flex items-center justify-center text-slate-400 font-bold italic py-20">Sample volume pending activity.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Billing Terminal Side */}
          <aside className="w-full xl:w-[420px] shrink-0 space-y-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-[#ff782d]"></div> Station Billing Queue
            </h3>
            <div className="space-y-6">
              {system.visits.slice(-5).reverse().map((v, i) => (
                <CheckoutCard 
                  key={i} 
                  visit={v} 
                  patient={system.patients.find(p => p.id === v.patientId)} 
                  onPrint={handlePrint}
                  doctorName={doctorProfile.name}
                  darkMode={darkMode}
                />
              ))}
              {system.visits.length === 0 && (
                 <div className="bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-slate-800 rounded-[32px] p-16 text-center shadow-lg">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                     <FileText size={32} />
                   </div>
                   <p className="text-slate-400 font-bold italic">No pending transactions.</p>
                 </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Modal: Clinical Notes */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0a0f1e] rounded-[40px] w-full max-w-xl shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#1a4fbc] text-white">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Finalize EMR session</h3>
                  <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">Pharmacotherapy Confirmation</p>
                </div>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
             </div>
             
             <div className="bg-slate-50 dark:bg-slate-900 p-8 flex items-center gap-6 m-10 mb-0 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-[#1a4fbc] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">
                  {servingPatient.name[0]}
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{servingPatient.name}</p>
                  <p className="text-xs text-slate-400 font-black mt-2 tracking-widest uppercase">{servingPatient.id} • Session Locked</p>
                </div>
             </div>

             <form onSubmit={handleCompleteConsultation} className="p-10 space-y-8 text-slate-900 dark:text-white">
               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Diagnosis</label>
                   <input name="diag" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-[#1a4fbc] transition-all font-bold" placeholder="Diagnosis summary..." />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Electronic Prescription</label>
                   <textarea name="rx" required rows="4" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none resize-none transition-all font-bold" placeholder="Dosage and duration..." />
                 </div>
               </div>
               <div className="flex gap-6">
                  <button onClick={() => setShowVisitModal(false)} type="button" className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all">Abort</button>
                  <button className="flex-[2] bg-[#ff782d] text-white py-5 rounded-2xl text-sm font-black shadow-xl shadow-orange-500/20 hover:bg-[#e66a25] transition-all">Sign & Close EMR</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {message && (
        <div className={`fixed bottom-28 md:bottom-12 right-1/2 translate-x-1/2 md:translate-x-0 md:right-12 px-8 py-5 rounded-3xl shadow-2xl z-[200] flex items-center gap-5 text-white font-black animate-in slide-in-from-right duration-500 backdrop-blur-xl border border-white/20 ${message.type === 'error' ? 'bg-rose-600/95' : 'bg-slate-900/95'}`}>
           {message.type === 'error' ? <X size={24} /> : <Check size={24} className="text-emerald-400" />}
           <span className="text-base tracking-tight">{message.text}</span>
           <button onClick={() => setMessage(null)} className="ml-6 opacity-50 hover:opacity-100 transition-opacity">
             <X size={20} />
           </button>
        </div>
      )}

    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/10">
        <Check size={18} strokeWidth={4} className="text-white" />
      </div>
      <p className="text-xl font-bold text-blue-50">{text}</p>
    </div>
  );
}

function SideIcon({ icon, active, onClick, mobile, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`relative p-4 rounded-2xl transition-all group ${active ? 'bg-white text-[#1a4fbc] shadow-xl scale-110' : 'text-blue-100/60 hover:text-white hover:bg-white/5'}`}
      title={label}
    >
      {icon}
      {active && !mobile && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full"></div>}
    </button>
  );
}

function HeaderAction({ icon, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all relative ${active ? 'bg-white/20 text-white' : 'text-blue-100/70 hover:bg-white/10 hover:text-white'}`}
    >
      {icon}
      {active && <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff782d] rounded-full border-2 border-[#1a4fbc]"></div>}
    </button>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-sm font-black text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}

function StatCard({ label, value, subLabel, icon, color }) {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-8 text-slate-900 dark:text-white group hover:translate-y-[-4px] transition-all">
       <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-inner ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
         {icon}
       </div>
       <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
         <p className="text-4xl font-black mt-2 tracking-tighter leading-none">{value}</p>
         <p className="text-[11px] font-bold text-slate-400 mt-3">{subLabel}</p>
       </div>
    </div>
  );
}

function DoctorCard({ name, isServing, patient, onStart, onComplete, darkMode }) {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] rounded-[32px] p-10 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row gap-10 items-center justify-between group relative overflow-hidden transition-all text-slate-900 dark:text-white">
      <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${isServing ? 'bg-emerald-500' : 'bg-[#1a4fbc]'}`}></div>
      
      <div className="flex items-center gap-8">
        <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center font-black text-4xl text-[#1a4fbc] dark:text-blue-400">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="text-3xl font-black tracking-tight leading-none">{name}</h4>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4">Attending Consultant • Triage Access</p>
          <div className="flex items-center gap-4 mt-6">
             <span className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl border-2 ${isServing ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/40' : 'bg-blue-50 text-[#1a4fbc] border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/40'}`}>
               <span className={`w-2 h-2 rounded-full ${isServing ? 'bg-emerald-500 animate-pulse' : 'bg-[#1a4fbc]'}`}></span> {isServing ? 'EMR SESSION ACTIVE' : 'SYSTEM AVAILABLE'}
             </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-sm w-full">
        {isServing && patient ? (
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner animate-in fade-in zoom-in-95">
             <div className="flex justify-between items-start">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Consultation</p>
                  <p className="text-2xl font-black leading-none">{patient.name}</p>
                  <p className="text-[10px] text-slate-500 font-black mt-3 tracking-widest uppercase">{patient.id}</p>
               </div>
               <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xs font-black shadow-md border border-slate-100 dark:border-slate-700 text-[#1a4fbc]">45</div>
             </div>
          </div>
        ) : (
          <div className="py-10 text-center px-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
             <p className="text-sm text-slate-400 font-bold italic">Station idle. Initiate triage to access records.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full md:w-auto">
        {isServing ? (
          <button 
            onClick={onComplete}
            className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]">
            Complete Session
          </button>
        ) : (
          <button 
            onClick={onStart}
            className="px-12 py-5 bg-[#1a4fbc] text-white rounded-2xl font-black text-base hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]">
            Initiate Session
          </button>
        )}
        <button className="flex items-center justify-center gap-2 text-xs font-black text-slate-400 hover:text-[#1a4fbc] transition-colors py-2 uppercase tracking-widest">
           Workstation Console <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${active ? 'bg-[#1a4fbc] text-white shadow-xl' : 'text-slate-400 hover:text-[#1a4fbc] dark:hover:text-blue-400'}`}>
      {children}
    </button>
  );
}

function QueueItem({ patient, index, qNum, onCancel, isMissed, darkMode }) {
  return (
    <div className={`bg-white dark:bg-[#0a0f1e] border-2 border-slate-100 dark:border-slate-800 p-6 rounded-[32px] flex items-center justify-between group transition-all hover:border-[#1a4fbc]/30 hover:shadow-xl ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center gap-8">
        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-slate-300 group-hover:text-[#1a4fbc] transition-all">
          {index + 1}
        </div>
        <div>
          <div className="flex items-center gap-4">
            <p className="font-black text-xl text-slate-900 dark:text-white leading-none">{patient.name}</p>
            <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-[#1a4fbc] dark:text-blue-400 px-3 py-1.5 rounded-lg uppercase tracking-widest">{patient.id}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-bold flex items-center gap-4">
             <span className="flex items-center gap-1.5 uppercase"><Calendar size={14} /> {patient.age} Yrs</span>
             <span className="flex items-center gap-1.5"><Phone size={14} /> {patient.phone}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div className="text-right hidden sm:block">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">UID REF</p>
           <p className="text-lg font-black text-slate-900 dark:text-white mt-1">#{qNum}</p>
        </div>
        {!isMissed ? (
          <button 
            onClick={onCancel}
            className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        ) : (
          <div className="px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-xs font-black rounded-xl uppercase tracking-widest border-2 border-rose-100 dark:border-rose-900/30">
            No Show
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ visit }) {
  return (
    <div className="relative pl-14 pb-12 group last:pb-0 text-slate-900 dark:text-white">
      <div className="absolute left-0 top-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center z-10 text-[#1a4fbc] group-hover:scale-110 group-hover:shadow-lg transition-all">
         <FileText size={20} />
      </div>
      <div className="absolute left-5 top-10 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 group-last:hidden rounded-full"></div>
      
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 transition-all hover:shadow-xl">
        <div className="flex items-center justify-between mb-6">
           <span className="text-[11px] font-black text-[#1a4fbc] dark:text-blue-400 uppercase tracking-[0.2em]">{new Date(visit.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
           <span className="text-[11px] font-black text-slate-300 uppercase">{new Date(visit.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p className="text-2xl font-black tracking-tight mb-4 leading-none">{visit.diagnosis}</p>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-l-[6px] border-[#1a4fbc] mt-6">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Electronic Treatment Directive</p>
           <p className="text-base font-bold italic text-slate-700 dark:text-slate-300 leading-relaxed">"{visit.prescription}"</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, trend, description, icon }) {
  return (
    <div className="bg-white dark:bg-[#0a0f1e] p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl text-slate-900 dark:text-white group hover:translate-y-[-8px] transition-all">
      <div className="flex items-center justify-between mb-10">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-[#1a4fbc] shrink-0 shadow-inner group-hover:scale-110 transition-all">{icon}</div>
        <span className="text-xs font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border-2 border-emerald-100">{trend}</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{title}</p>
      <div className="text-7xl font-black mt-4 tracking-tighter leading-none">{value}</div>
      <p className="text-sm text-slate-500 mt-8 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function CheckoutCard({ visit, patient, onPrint, doctorName, darkMode }) {
  return (
    <div className={`bg-white dark:bg-[#0a0f1e] rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-all hover:shadow-2xl animate-in slide-in-from-right-10 duration-500 ${darkMode ? 'dark' : ''} text-slate-900 dark:text-white`}>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#1a4fbc] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shrink-0">{patient?.name?.[0] || 'P'}</div>
          <div className="overflow-hidden">
            <p className="text-lg font-black tracking-tight leading-none truncate">{patient?.name || 'Unknown UID'}</p>
            <p className="text-[10px] text-slate-400 font-black mt-2 tracking-widest uppercase">{patient?.id}</p>
          </div>
        </div>
        <button 
          onClick={() => onPrint(patient, visit)}
          className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-110 transition-all shadow-sm shrink-0"
        >
          <FileText size={20} />
        </button>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Record Summary</span>
        <p className="text-xs font-bold leading-relaxed truncate">{visit.diagnosis}: {visit.prescription}</p>
      </div>
      
      <div className="flex items-center justify-between pt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Consultation</p>
           <p className="text-2xl font-black text-[#1a4fbc] dark:text-blue-400 tracking-tighter mt-2 leading-none">₹500.00</p>
        </div>
        <button 
          onClick={() => onPrint(patient, visit)}
          className="bg-[#ff782d] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 hover:bg-[#e66a25] active:scale-95 transition-all"
        >
          Finalize & Print
        </button>
      </div>
    </div>
  );
}
