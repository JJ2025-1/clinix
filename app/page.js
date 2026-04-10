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
  const [activeTab, setActiveTab] = useState('home'); // Now representing EMR
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

  // Redesigned Login View based on image
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#1a4fbc] text-white">
        {/* Left Side: Content */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12">
          <div className="mb-12">
            <h2 className="text-3xl font-black tracking-tight mb-8">Clinix</h2>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Run Your Clinic <br />
              <span className="text-[#ff782d]">Smarter.</span> Not Harder.
            </h1>
            <p className="text-xl text-blue-100/80 max-w-xl leading-relaxed mb-10">
              Clinix is the all-in-one powered clinic management system that securely stores, accesses and shares complete patient histories, diagnoses, prescriptions and medical notes digitally from anywhere.
            </p>
            
            <div className="space-y-5">
              <FeatureItem text="Personalized dashboard tailored to your specialty" />
              <FeatureItem text="No commitment, completely free for clinical practice" />
              <FeatureItem text="Go live in as little as 24 hours after sign up" />
            </div>
          </div>
          
          <div className="flex gap-10 opacity-60 text-sm font-medium">
             <span className="flex items-center gap-2"><CheckCircle2 size={16} /> No credit card required</span>
             <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Setup in 24 hours</span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[540px] p-8 md:p-12 text-slate-900">
            <div className="mb-10">
              <h3 className="text-3xl font-bold mb-2">Clinician Login</h3>
              <p className="text-slate-500 font-medium">Please enter your credentials to access the EMR system.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name *</label>
                <input name="doctorName" required className="w-full border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" placeholder="Full name" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Standard Doc ID *</label>
                  <input name="doctorId" required className="w-full border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" placeholder="DOC-123" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                  <input name="doctorPhone" required className="w-full border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#ff782d] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:bg-[#e66a25] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Access Dashboard →
                </button>
              </div>
            </form>
            
            <p className="mt-8 text-center text-slate-400 text-xs font-medium">
              By logging in, you agree to the Clinix Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const waitingPatients = getWaitingPatients();
  const frequentVisitors = system.getFrequentVisitors(1);

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-20 bg-slate-900 dark:bg-black flex-col items-center py-8 shrink-0 z-20">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-12 shadow-lg shadow-blue-500/20">
          <Activity size={24} />
        </div>
        
        <div className="flex flex-col gap-8 w-full items-center">
          <SideIcon icon={<Home size={22} />} active={activeTab === 'home'} label="EMR" onClick={() => setActiveTab('home')} />
          <SideIcon icon={<Plus size={22} />} active={activeTab === 'register'} label="Register" onClick={() => setActiveTab('register')} />
          <SideIcon icon={<FileText size={22} />} active={activeTab === 'history'} label="History" onClick={() => setActiveTab('history')} />
          <SideIcon icon={<BarChart3 size={22} />} active={activeTab === 'reports'} label="Reports" onClick={() => setActiveTab('reports')} />
        </div>

        <button onClick={handleLogout} className="mt-auto p-3 text-slate-500 hover:text-rose-500 transition-colors">
          <LogOut size={22} />
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50 px-2 transition-colors text-[10px] font-bold">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}><Home size={20} /> EMR</button>
        <button onClick={() => setActiveTab('register')} className={`flex flex-col items-center gap-1 ${activeTab === 'register' ? 'text-blue-600' : 'text-slate-400'}`}><Plus size={20} /> Add</button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}><FileText size={20} /> Records</button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 ${activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`}><BarChart3 size={20} /> Analytics</button>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-20 md:pb-0">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-10 py-5 shrink-0 z-10 sticky top-0 transition-colors shadow-sm">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                Clinix
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-[0.1em] mt-0.5 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> EMR Active • Pulse QuickCare
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <form onSubmit={handleSearch} className="relative hidden lg:block w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Patient UID Search..." 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 border border-transparent focus:border-blue-500/20 transition-all font-medium"
                />
              </form>
              
              <div className="flex items-center gap-2 md:gap-4">
                <HeaderAction icon={<Bell size={18} />} onClick={() => toggleMenu('notifications')} active={activeMenu === 'notifications'} />
                <HeaderAction icon={<Settings size={18} />} onClick={() => toggleMenu('settings')} active={activeMenu === 'settings'} />
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2 hidden sm:block"></div>
                <div className="relative group">
                  <button 
                    onClick={() => toggleMenu('profile')}
                    className="flex items-center gap-3 p-1 pl-1 md:pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent active:border-slate-200"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold leading-none">{doctorProfile.name}</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-mono">{doctorProfile.id}</p>
                    </div>
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-900 dark:bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {doctorProfile.name[0]}
                    </div>
                  </button>
                  
                  {activeMenu === 'profile' && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 z-[100] animate-in fade-in slide-in-from-top-2">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Staff Profile</h4>
                       <div className="space-y-4">
                          <ProfileRow label="Role" value="Senior Consultant" />
                          <ProfileRow label="ID Number" value={doctorProfile.id} />
                          <ProfileRow label="Contact" value={doctorProfile.phone} />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          {activeMenu === 'settings' && (
            <div className="absolute right-10 md:right-24 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-[100] animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">System Settings</h4>
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between text-xs p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                  <span className="font-medium">System Diagnostics</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1"></div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between text-xs p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="font-medium">Interface Theme: {darkMode ? 'Dark' : 'Light'}</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 md:p-10 flex flex-col xl:flex-row gap-8 lg:gap-12 max-w-[1600px] mx-auto w-full">
          <div className="flex-1 flex flex-col gap-10">
            
            {activeTab === 'home' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Waiting Queue" value={waitingPatients.length} subValue="Patients active" icon={<Users className="text-blue-500" />} />
                  <StatCard label="EMR Monthly" value={system.getTotalVisitsThisMonth()} subValue="Records created" icon={<Activity className="text-emerald-500" />} />
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transition-all group-hover:bg-blue-500/30"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Station Time</p>
                    <p className="text-3xl font-black mt-2 tracking-tight">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    <p className="text-[10px] font-medium text-blue-400 mt-2">{currentTime.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Active EMR Session
                    </h3>
                  </div>
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Electronic Triage
                    </h3>
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                      <TabBtn active={queueTab === 'upcoming'} onClick={() => setQueueTab('upcoming')}>Active ({waitingPatients.length})</TabBtn>
                      <TabBtn active={queueTab === 'missed'} onClick={() => setQueueTab('missed')}>No Show ({system.missed.length})</TabBtn>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
                         <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                           <Clock size={32} />
                         </div>
                         <p className="text-slate-400 font-medium text-sm">No electronic records found in this category.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'register' && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto w-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 p-8 text-white relative">
                   <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
                   <h3 className="text-xl font-bold">New Patient Intake</h3>
                   <p className="text-slate-400 text-xs mt-1">Complete all fields to generate Electronic Medical ID</p>
                </div>
                <form onSubmit={handleRegister} className="p-10 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Personal Particulars</label>
                      <input name="name" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white" placeholder="Full Name (Official Identification)" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <input name="age" type="number" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-5 py-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white" placeholder="Legal Age" />
                      </div>
                      <div className="relative">
                        <input name="phone" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-5 py-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white" placeholder="Mobile Primary" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-lg font-bold shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.99]">
                    <Plus size={20} /> Generate Record & Assign ID
                  </button>
                </form>
              </section>
            )}

            {activeTab === 'history' && (
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
                {searchResult ? (
                  <div>
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl shadow-blue-500/10">
                          {searchResult.patient.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                             <h3 className="text-2xl font-black tracking-tight">{searchResult.patient.name}</h3>
                             <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800">{searchResult.patient.id}</span>
                          </div>
                          <div className="flex items-center gap-6 mt-2 text-slate-500 text-sm font-medium">
                             <span className="flex items-center gap-2"><User size={14} className="text-slate-400" /> {searchResult.patient.age} yrs</span>
                             <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {searchResult.patient.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSearchResult(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={24} /></button>
                    </div>
                    <div className="p-8">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                         <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
                         Clinical Encounter Timeline
                         <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
                       </h4>
                       <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                         {searchResult.history.length > 0 ? [...searchResult.history].reverse().map((v, i) => (
                           <HistoryItem key={i} visit={v} />
                         )) : (
                           <div className="py-20 text-center text-slate-400 italic">No historical encounters found for this profile.</div>
                         )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-40 text-center">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Search size={48} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Archives & Intelligence</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">Access comprehensive patient history by searching for their unique Medical UID in the search bar above.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard 
                  title="EMR Throughput" 
                  value={system.getTotalVisitsThisMonth()} 
                  trend="+12%" 
                  description="Aggregate volume of finalized electronic records this month."
                  icon={<Activity size={24} />}
                />
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600"><TrendingUp size={28} /></div>
                    <div>
                       <h3 className="text-lg font-bold">Frequent Cohorts</h3>
                       <p className="text-xs text-slate-400 mt-1">Recurrent patients (>1 visit)</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {frequentVisitors.length > 0 ? frequentVisitors.map(v => (
                      <div key={v.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-slate-900 dark:text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">{v.name[0]}</div>
                          <span className="font-bold text-sm">{v.name}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 uppercase">Records Found</span>
                      </div>
                    )) : (
                      <div className="h-full flex items-center justify-center opacity-30 italic text-sm py-20">Statistical data pending higher sample volume.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Billing Queue */}
          <aside className="w-full xl:w-[380px] shrink-0 space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> Post-Consultation Workflow
            </h3>
            <div className="space-y-5">
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
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                   <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                     <FileText size={24} />
                   </div>
                   <p className="text-xs text-slate-400 font-medium italic">No pending workflow items found.</p>
                 </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Modal: Clinical Notes */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-white">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">EMR Conclusion</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Electronic Prescription & Discharge</p>
                </div>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
             </div>
             
             <div className="bg-slate-50 dark:bg-slate-800 p-6 flex items-center gap-5 m-8 mb-0 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                  {servingPatient.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{servingPatient.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{servingPatient.id} • Triage Verified</p>
                </div>
             </div>

             <form onSubmit={handleCompleteConsultation} className="p-8 space-y-6">
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Clinical Diagnosis</label>
                   <input name="diag" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white" placeholder="Primary diagnosis code or description..." />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Prescription & Pharmacotherapy</label>
                   <textarea name="rx" required rows="4" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 outline-none resize-none transition-all text-sm font-medium text-slate-900 dark:text-white" placeholder="Enter dosage, frequency, and duration..." />
                 </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowVisitModal(false)} type="button" className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <button className="flex-[2] bg-blue-600 text-white py-4 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Finalize Record</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {message && (
        <div className={`fixed bottom-24 md:bottom-10 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 px-6 py-4 rounded-xl shadow-2xl z-[200] flex items-center gap-4 text-white font-bold animate-in slide-in-from-right duration-500 backdrop-blur-md border border-white/20 ${message.type === 'error' ? 'bg-rose-600/90' : 'bg-slate-900/90'}`}>
           {message.type === 'error' ? <X size={20} /> : <CheckCircle2 size={20} className="text-emerald-400" />}
           <span className="text-sm tracking-tight">{message.text}</span>
           <button onClick={() => setMessage(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
             <X size={16} />
           </button>
        </div>
      )}

    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
        <Check size={14} className="text-white" />
      </div>
      <p className="text-lg font-medium text-blue-50">{text}</p>
    </div>
  );
}

function SideIcon({ icon, active, onClick, mobile, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`relative p-3.5 rounded-xl transition-all group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
      title={label}
    >
      {icon}
      {active && !mobile && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-lg"></div>}
    </button>
  );
}

function HeaderAction({ icon, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2.5 rounded-lg transition-all relative ${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'}`}
    >
      {icon}
      {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></div>}
    </button>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{label}</span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

function StatCard({ label, value, subValue, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 text-slate-900 dark:text-white">
       <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">{icon}</div>
       <div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-2xl font-black mt-0.5">{value}</p>
         <p className="text-[10px] font-medium text-slate-500 mt-0.5">{subValue}</p>
       </div>
    </div>
  );
}

function DoctorCard({ name, isServing, patient, onStart, onComplete, darkMode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between group relative overflow-hidden transition-all hover:shadow-lg text-slate-900 dark:text-white">
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${isServing ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
      
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-lg flex items-center justify-center font-bold text-3xl text-slate-900 dark:text-white">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="text-2xl font-black tracking-tight">{name}</h4>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Surgical Specialist • Attending Consultant</p>
          <div className="flex items-center gap-3 mt-4">
             <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border ${isServing ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/40' : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${isServing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></span> {isServing ? 'IN EMR SESSION' : 'AVAILABLE FOR TRIAGE'}
             </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-sm w-full">
        {isServing && patient ? (
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95">
             <div className="flex justify-between items-start">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Patient in consultation</p>
                  <p className="text-lg font-bold">{patient.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{patient.id} • Registered Profile</p>
               </div>
               <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-black shadow-sm border border-slate-100 dark:border-slate-600">45</div>
             </div>
          </div>
        ) : (
          <div className="py-8 text-center px-6">
             <p className="text-xs text-slate-400 font-medium italic">EMR workstation is idle. Initiate session to access patient records.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full md:w-auto">
        {isServing ? (
          <button 
            onClick={onComplete}
            className="px-10 py-4 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
            Finalize Session
          </button>
        ) : (
          <button 
            onClick={onStart}
            className="px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
            Initiate Session
          </button>
        )}
        <button className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2">
           Workstation Settings <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-md text-[10px] font-bold transition-all ${active ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
      {children}
    </button>
  );
}

function QueueItem({ patient, index, qNum, onCancel, isMissed, darkMode }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm ${darkMode ? 'dark' : ''}`}>
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
          {index + 1}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <p className="font-bold text-slate-900 dark:text-white leading-none">{patient.name}</p>
            <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase">{patient.id}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-2">
             <Calendar size={10} /> {patient.age} yrs • <Phone size={10} /> {patient.phone}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UID Reference</p>
           <p className="text-sm font-black text-slate-900 dark:text-white">#{qNum}</p>
        </div>
        {!isMissed ? (
          <button 
            onClick={onCancel}
            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
            title="Mark as No Show"
          >
            <X size={18} />
          </button>
        ) : (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">
            No Show
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ visit }) {
  return (
    <div className="relative pl-10 pb-10 group last:pb-0">
      <div className="absolute left-0 top-0 w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center z-10 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
         <FileText size={16} />
      </div>
      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 group-last:hidden"></div>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-all hover:shadow-md text-slate-900 dark:text-white">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{new Date(visit.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
           <span className="text-[10px] font-medium text-slate-400">{new Date(visit.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p className="text-xl font-bold tracking-tight mb-2">{visit.diagnosis}</p>
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-l-4 border-slate-900 dark:border-blue-600">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescribed Treatment</p>
           <p className="text-sm font-medium italic text-slate-600 dark:text-slate-300">"{visit.prescription}"</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, trend, description, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600">{icon}</div>
        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">{trend}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <div className="text-6xl font-black mt-2 tracking-tighter">{value}</div>
      <p className="text-xs text-slate-500 mt-4 leading-relaxed">{description}</p>
    </div>
  );
}

function CheckoutCard({ visit, patient, onPrint, doctorName, darkMode }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg animate-in slide-in-from-right-4 duration-500 ${darkMode ? 'dark' : ''} text-slate-900 dark:text-white`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md">{patient?.name?.[0] || 'P'}</div>
          <div>
            <p className="text-sm font-bold tracking-tight">{patient?.name || 'Unknown Profile'}</p>
            <p className="text-[10px] text-slate-400 font-mono">{patient?.id}</p>
          </div>
        </div>
        <button 
          onClick={() => onPrint(patient, visit)}
          className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <FileText size={16} />
        </button>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6 border border-slate-100 dark:border-slate-700">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">EMR Snapshot</span>
        <p className="text-[11px] font-medium leading-relaxed truncate">{visit.diagnosis}: {visit.prescription}</p>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Station Billing</p>
           <p className="text-lg font-black text-slate-900 dark:text-blue-400 tracking-tight">₹500.00</p>
        </div>
        <button 
          onClick={() => onPrint(patient, visit)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Finalize & Print
        </button>
      </div>
    </div>
  );
}
