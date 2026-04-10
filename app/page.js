'use client';

import React, { useState, useEffect } from 'react';
import { HospitalSystem } from '@/lib/hospitalSystem';
import {
  Home, Users, FileText, PieChart, Search, Bell, User, Settings, X, Stethoscope, MoreHorizontal, Activity, TrendingUp, LogOut
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
  
  // Modals for header icons
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track the patient being served by the doctor
  const [servingPatient, setServingPatient] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hs = new HospitalSystem();
    setSystem(hs);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check for saved login
    const savedDoctor = localStorage.getItem('clinix_doctor');
    if (savedDoctor) {
      setDoctorProfile(JSON.parse(savedDoctor));
      setIsLoggedIn(true);
    }

    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    setSystem(Object.assign(Object.create(Object.getPrototypeOf(system)), system));
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
      setMessage({ type: 'success', text: `Patient ${p.name} added to queue (ID: ${p.id})` });
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
      setMessage({ type: 'success', text: 'Visit recorded successfully.' });
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
          <title>Clinix Bill - ${patient.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #2d55a4; padding-bottom: 20px; }
            .total { font-size: 24px; font-weight: bold; color: #2d55a4; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header"><h1>CLINIX MEDICAL CENTER</h1><p>Invoice for Services</p></div>
          <p><b>Patient:</b> ${patient.name} (${patient.id})</p>
          <p><b>Doctor:</b> Dr. ${doctorProfile.name}</p>
          <p><b>Date:</b> ${new Date(visit.date).toLocaleString('en-IN')}</p>
          <hr/>
          <p><b>Diagnosis:</b> ${visit.diagnosis}</p>
          <p><b>Prescription:</b> ${visit.prescription}</p>
          <hr/>
          <div class="total">Total: ₹500.00</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!system) return null;

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#2d55a4]">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-[#2d55a4] rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-sm">
              C
            </div>
            <h1 className="text-3xl font-black text-[#2d55a4]">CLINIX</h1>
            <p className="text-slate-400 font-medium">Doctor Portal Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Doctor Name</label>
              <input name="doctorName" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#2d55a4] transition-all" placeholder="Dr. Jeevan" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Employee ID</label>
              <input name="doctorId" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#2d55a4] transition-all" placeholder="EMP-123" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
              <input name="doctorPhone" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#2d55a4] transition-all" placeholder="+91 9876543210" />
            </div>
            <button type="submit" className="w-full bg-[#2d55a4] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Enter Clinic
            </button>
          </form>
        </div>
      </div>
    );
  }

  const waitingPatients = getWaitingPatients();
  const frequentVisitors = system.getFrequentVisitors(1); // Set to >1 for better visibility in small datasets

  return (
    <div className="flex h-screen w-full bg-[#f4f6f8] text-[#1e293b] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-6 shrink-0 z-20">
        <div className="w-11 h-11 bg-blue-50 text-[#2d55a4] rounded-xl flex items-center justify-center font-black text-2xl mb-10 shadow-sm">
          C
        </div>
        
        <div className="flex flex-col gap-6 w-full items-center">
          <SideIcon icon={<Home size={22} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SideIcon icon={<Users size={22} />} active={activeTab === 'register'} onClick={() => setActiveTab('register')} />
          <SideIcon icon={<FileText size={22} />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SideIcon icon={<PieChart size={22} />} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </div>

        <button onClick={handleLogout} className="mt-auto p-3 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={22} />
        </button>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Header */}
        <div className="bg-[#2d55a4] text-white px-10 py-7 shrink-0 relative shadow-lg">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Clinix Dashboard</h1>
            
            <div className="flex items-center gap-6">
              <form onSubmit={handleSearch} className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Patient ID (e.g. P101)" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-white text-slate-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none shadow-inner"
                />
              </form>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <User size={20} className="cursor-pointer hover:text-blue-200" onClick={() => setShowProfile(!showProfile)} />
                  {showProfile && (
                    <div className="absolute right-0 mt-3 w-64 bg-white text-slate-800 p-5 rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold border-b pb-2 mb-3">Doctor Profile</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-400 uppercase text-[10px] font-bold block">Name</span> <span className="font-bold">{doctorProfile.name}</span></p>
                        <p><span className="text-slate-400 uppercase text-[10px] font-bold block">ID</span> <span className="font-bold">{doctorProfile.id}</span></p>
                        <p><span className="text-slate-400 uppercase text-[10px] font-bold block">Phone</span> <span className="font-bold">{doctorProfile.phone}</span></p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Bell size={20} className="cursor-pointer hover:text-blue-200" onClick={() => setShowNotifications(!showNotifications)} />
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-64 bg-white text-slate-800 p-5 rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold border-b pb-2 mb-3">Notifications</h4>
                      <p className="text-xs text-slate-400 italic">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Settings size={20} className="cursor-pointer hover:text-blue-200" onClick={() => setShowSettings(!showSettings)} />
                  {showSettings && (
                    <div className="absolute right-0 mt-3 w-64 bg-white text-slate-800 p-5 rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold border-b pb-2 mb-3">Settings</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left text-sm hover:text-blue-600 transition-colors py-1">System Update</button>
                        <button className="w-full text-left text-sm hover:text-blue-600 transition-colors py-1 border-t pt-1">Dark Mode</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black mb-1">Expresscare Medical Clinic</h2>
              <p className="text-blue-100/70 text-sm font-bold">Open • {system.patients.length} Registered Patients</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-80">{currentTime.toLocaleDateString('en-IN', { dateStyle: 'full', timeZone: 'Asia/Kolkata' })}</p>
              <p className="text-xl font-black">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-10 flex flex-col xl:flex-row gap-10">
          <div className="flex-1 flex flex-col gap-10">
            
            {activeTab === 'home' && (
              <>
                <section>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">On Duty</h3>
                  </div>
                  <div className="max-w-md">
                    <DoctorCard 
                      name={doctorProfile.name} 
                      isServing={!!servingPatient}
                      patient={servingPatient}
                      onStart={startConsultation}
                      onComplete={() => setShowVisitModal(true)}
                    />
                  </div>
                </section>

                <section className="flex-1 flex flex-col">
                  <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-5">Patient Queue</h3>
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex-1">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex bg-slate-100 rounded-2xl p-1">
                        <TabBtn active={queueTab === 'upcoming'} onClick={() => setQueueTab('upcoming')}>
                          Upcoming <span className="ml-2 bg-white/50 px-2 py-0.5 rounded-lg">{waitingPatients.length}</span>
                        </TabBtn>
                        <TabBtn active={queueTab === 'missed'} onClick={() => setQueueTab('missed')}>
                          Missed <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-lg">0</span>
                        </TabBtn>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-5">
                      {queueTab === 'upcoming' && waitingPatients.map((p, i) => (
                        <QueueItem 
                          key={p.id} 
                          patient={p} 
                          qNum={101 + system.patients.indexOf(p)} 
                          confirmed={true} 
                        />
                      ))}
                      {queueTab === 'upcoming' && waitingPatients.length === 0 && (
                        <div className="text-center py-16">
                          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                             <Users size={40} />
                          </div>
                          <p className="text-slate-400 font-bold italic">No patients waiting in queue</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'register' && (
              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 max-w-lg mx-auto w-full animate-in slide-in-from-bottom-5">
                <h3 className="text-2xl font-black mb-8">Register New Patient</h3>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Patient Full Name</label>
                    <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#2d55a4] focus:ring-4 focus:ring-blue-50 transition-all font-medium" placeholder="e.g. Abhinav" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age</label>
                      <input name="age" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none transition-all font-medium" placeholder="25" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone</label>
                      <input name="phone" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none transition-all font-medium" placeholder="9876543210" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#2d55a4] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/10 hover:scale-[1.02] transition-all mt-4">
                    Confirm Registration
                  </button>
                </form>
              </section>
            )}

            {activeTab === 'history' && (
              <section className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm animate-in fade-in">
                {searchResult ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#2d55a4] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-900/20">
                          {searchResult.patient.name[0]}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black">{searchResult.patient.name}</h3>
                          <p className="text-[#2d55a4] font-mono font-bold text-lg">{searchResult.patient.id}</p>
                        </div>
                      </div>
                      <button onClick={() => setSearchResult(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-5 rounded-2xl"><span className="text-slate-400 font-bold uppercase text-[10px] block mb-1 tracking-widest">Age</span> <span className="font-bold text-xl">{searchResult.patient.age}</span></div>
                        <div className="bg-slate-50 p-5 rounded-2xl"><span className="text-slate-400 font-bold uppercase text-[10px] block mb-1 tracking-widest">Phone</span> <span className="font-bold text-xl">{searchResult.patient.phone}</span></div>
                      </div>
                      <div className="md:col-span-2 space-y-5">
                         <h4 className="font-bold text-lg border-b pb-3 flex items-center gap-2"><FileText size={20} className="text-[#2d55a4]" /> Clinical History</h4>
                         <div className="space-y-5 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                           {searchResult.history.length > 0 ? [...searchResult.history].reverse().map((v, i) => (
                             <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-[#2d55a4]/50 transition-all">
                               <div className="text-xs font-bold text-[#2d55a4] mb-2 uppercase tracking-tighter">{new Date(v.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                               <p className="font-black text-lg mb-2">{v.diagnosis}</p>
                               <div className="bg-slate-50 p-3 rounded-xl text-sm italic text-slate-500 border-l-4 border-slate-200">
                                 Rx: {v.prescription}
                               </div>
                             </div>
                           )) : (
                             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                               <p className="text-slate-400 font-bold italic">No visits recorded for this patient.</p>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Search size={48} />
                    </div>
                    <h3 className="text-xl font-bold">Patient Records Search</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Enter a unique Patient ID in the top search bar to view their medical history and data.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reports' && (
               <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 bg-blue-50 rounded-2xl text-[#2d55a4]"><Activity size={32} /></div>
                      <h3 className="text-xl font-black">Monthly Summary</h3>
                    </div>
                    <div className="text-7xl font-black text-[#2d55a4] mb-3 tracking-tighter">{system.getTotalVisitsThisMonth()}</div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Patient Visits in {currentTime.toLocaleString('en-IN', { month: 'long' })}</p>
                  </div>
                  <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500"><TrendingUp size={32} /></div>
                      <h3 className="text-xl font-black">Frequent Visitors</h3>
                    </div>
                    <div className="space-y-4 flex-1">
                      {frequentVisitors.length > 0 ? frequentVisitors.map(v => (
                        <div key={v.id} className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#2d55a4] text-white rounded-xl flex items-center justify-center font-bold">{v.name[0]}</div>
                            <span className="font-bold text-lg">{v.name}</span>
                          </div>
                          <span className="bg-blue-100 text-[#2d55a4] px-4 py-2 rounded-xl text-sm font-black shadow-sm">{v.visitCount} visits</span>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
                          <p className="text-slate-400 font-bold italic">No frequent visitors found yet.</p>
                          <p className="text-[10px] text-slate-400">(Patients with 2+ visits)</p>
                        </div>
                      )}
                    </div>
                  </div>
               </section>
            )}

          </div>

          {/* Checkout Column */}
          <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Checkout Queue</h3>
            <div className="flex flex-col gap-5">
              {system.visits.slice(-5).reverse().map((v, i) => (
                <CheckoutCard 
                  key={i} 
                  visit={v} 
                  patient={system.patients.find(p => p.id === v.patientId)} 
                  onPrint={handlePrint}
                  doctorName={doctorProfile.name}
                />
              ))}
              {system.visits.length === 0 && (
                 <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center italic text-slate-400 text-sm shadow-sm font-medium">
                   No pending checkouts
                 </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* MODAL: Record Consultation */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Clinical Notes</h3>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
             </div>
             <div className="bg-[#2d55a4] p-6 rounded-2xl mb-8 text-white shadow-lg">
               <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Active Patient</p>
               <div className="flex justify-between items-center">
                 <h4 className="font-black text-xl">{servingPatient.name}</h4>
                 <span className="font-mono bg-white/20 px-3 py-1 rounded-lg text-sm">{servingPatient.id}</span>
               </div>
             </div>
             <form onSubmit={handleCompleteConsultation} className="space-y-6">
               <div>
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Diagnosis</label>
                 <input name="diag" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#2d55a4] transition-all" placeholder="e.g. Hypertension" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Prescription</label>
                 <textarea name="rx" required rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none resize-none transition-all" placeholder="e.g. Amlodipine 5mg OD" />
               </div>
               <button className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-900/10 hover:scale-[1.02] transition-all">
                 Finalize & Bill
               </button>
             </form>
           </div>
        </div>
      )}

      {/* Large Top Notification Toast */}
      {message && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 px-10 py-7 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-8 text-white font-black animate-in slide-in-from-top duration-500 min-w-[500px] border-2 border-white/20 backdrop-blur-xl ${message.type === 'error' ? 'bg-red-500/95' : 'bg-[#2d55a4]/95'}`}>
           <div className="p-4 bg-white/20 rounded-2xl shadow-inner">
             {message.type === 'error' ? <X size={32} /> : <Users size={32} />}
           </div>
           <div className="flex-1">
             <p className="text-[10px] opacity-60 uppercase tracking-[0.2em] mb-1 font-black">Clinix System Message</p>
             <span className="text-xl tracking-tight leading-tight">{message.text}</span>
           </div>
           <button onClick={() => setMessage(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90">
             <X size={28} />
           </button>
        </div>
      )}

    </div>
  );
}

function SideIcon({ icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`p-3.5 rounded-2xl transition-all relative group ${active ? 'bg-[#2d55a4] text-white shadow-xl shadow-blue-900/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
      {icon}
      {active && <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-2 h-8 bg-[#2d55a4] rounded-r-xl shadow-sm"></div>}
    </button>
  );
}

function DoctorCard({ name, isServing, patient, onStart, onComplete }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-full group transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-5 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2d55a4] flex items-center justify-center border-2 border-white shadow-lg font-black text-xl uppercase">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="font-black text-lg">{name}</h4>
          <p className={`text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest ${isServing ? 'text-green-500' : 'text-slate-300'}`}>
             <span className={`w-2 h-2 rounded-full ${isServing ? 'bg-green-500' : 'bg-slate-300'}`}></span> {isServing ? 'Currently Serving' : 'Available'}
          </p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-2xl p-6 flex-1 flex flex-col justify-center border border-dashed border-slate-200 mb-6 transition-all group-hover:bg-slate-100/50">
        {isServing && patient ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#2d55a4] text-white flex items-center justify-center font-black text-sm shadow-md">{patient.name[0]}</div>
              <div>
                <p className="font-black text-sm">{patient.name}</p>
                <p className="text-[10px] text-slate-400 font-mono tracking-tighter bg-white px-2 py-0.5 rounded-md inline-block">{patient.id}</p>
              </div>
            </div>
            <div className="bg-[#2d55a4] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm">45</div>
          </div>
        ) : <p className="text-sm text-slate-400 font-bold italic text-center py-4">No active consultation</p>}
      </div>
      <div className="flex gap-3">
        {isServing ? (
          <button 
            onClick={onComplete}
            className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-900/10">
            Complete
          </button>
        ) : (
          <button 
            onClick={onStart}
            className="flex-1 bg-[#2d55a4] text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
            Start Consultation
          </button>
        )}
        <button className="w-12 bg-white text-slate-300 rounded-2xl flex items-center justify-center hover:text-[#2d55a4] transition-colors border border-slate-100 shadow-sm"><MoreHorizontal size={20} /></button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${active ? 'bg-[#2d55a4] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
      {children}
    </button>
  );
}

function QueueItem({ patient, qNum, confirmed }) {
  return (
    <div className="border border-slate-100 rounded-3xl p-6 flex items-center justify-between group hover:border-[#2d55a4]/30 transition-all bg-white shadow-sm hover:shadow-md">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-blue-50 text-[#2d55a4] rounded-2xl flex items-center justify-center font-black text-lg border border-blue-100 shadow-inner">{patient.name[0]}</div>
        <div>
          <p className="font-black text-lg text-slate-800">{patient.name}</p>
          <p className={`text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-widest ${confirmed ? 'text-green-500' : 'text-slate-300'}`}>
            <span className={`w-2 h-2 rounded-full ${confirmed ? 'bg-green-500' : 'bg-slate-300'}`}></span> {confirmed ? 'Patient Confirmed' : 'In Queue'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="bg-slate-100 text-slate-500 text-xs font-black px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">#{qNum}</div>
        <button className="py-2.5 px-6 border border-red-50 text-red-400 text-xs font-black rounded-xl hover:bg-red-50 hover:border-red-100 transition-all">Cancel</button>
      </div>
    </div>
  );
}

function CheckoutCard({ visit, patient, onPrint, doctorName }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all animate-in slide-in-from-right-5">
      <div className="flex justify-between items-start border-b border-slate-50 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm">{patient?.name?.[0] || 'P'}</div>
          <div>
            <p className="font-black text-sm">{patient?.name || 'Guest'}</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 italic font-medium"><Stethoscope size={10} /> Consulated by Dr. {doctorName}</p>
          </div>
        </div>
        <div className="bg-[#2d55a4]/5 text-[#2d55a4] text-[10px] font-black px-2 py-1 rounded-lg border border-[#2d55a4]/10">{patient?.id}</div>
      </div>
      <div className="text-[11px] text-slate-500 mb-5 font-bold line-clamp-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
        <span className="text-[#2d55a4] uppercase text-[8px] block mb-1 tracking-widest opacity-60 font-black">Clinical Note</span>
        {visit.diagnosis}: {visit.prescription}
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-black text-[#2d55a4]">₹500.00</p>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Unpaid Balance</p>
        </div>
        <button 
          onClick={() => onPrint(patient, visit)}
          className="bg-[#2d55a4] text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-900/20 hover:scale-[1.05] transition-all"
        >
          Print Bill
        </button>
      </div>
    </div>
  );
}
