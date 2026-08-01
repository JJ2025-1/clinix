'use client';

import React, { useState, useEffect } from 'react';
import { HospitalSystem } from '@/lib/hospitalSystem';
import {
  Home, Users, FileText, BarChart3, Search, Bell, User, Settings, X, Stethoscope, Activity, TrendingUp, LogOut, ChevronRight, Plus, Phone, Calendar, ArrowRight, CheckCircle2, Clock, Check, Layers, ShieldCheck, Printer, AlertCircle, RefreshCw
} from 'lucide-react';

export default function ClinicApp() {
  const [system, setSystem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('clinician'); // 'clinician' | 'patient'
  const [userRole, setUserRole] = useState(null); // 'clinician' | 'patient'
  
  const [doctorProfile, setDoctorProfile] = useState({ name: '', id: '', phone: '', specialization: '' });
  const [patientProfile, setPatientProfile] = useState({ id: '', name: '', phone: '', age: '' });
  
  const [patientQuery, setPatientQuery] = useState('');
  const [isNewPatientReg, setIsNewPatientReg] = useState(false);

  const [activeTab, setActiveTab] = useState('home'); 
  const [queueTab, setQueueTab] = useState('upcoming');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [servingPatient, setServingPatient] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hs = new HospitalSystem();
    setSystem(hs);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const savedRole = localStorage.getItem('clinix_role');
    if (savedRole === 'clinician') {
      const savedDoctor = localStorage.getItem('clinix_doctor');
      if (savedDoctor) {
        setDoctorProfile(JSON.parse(savedDoctor));
        setUserRole('clinician');
        setIsLoggedIn(true);
      }
    } else if (savedRole === 'patient') {
      const savedPatient = localStorage.getItem('clinix_patient');
      if (savedPatient) {
        setPatientProfile(JSON.parse(savedPatient));
        setUserRole('patient');
        setIsLoggedIn(true);
      }
    } else {
      const savedDoctor = localStorage.getItem('clinix_doctor');
      if (savedDoctor) {
        setDoctorProfile(JSON.parse(savedDoctor));
        setUserRole('clinician');
        setIsLoggedIn(true);
      }
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const toggleMenu = (menu) => setActiveMenu(activeMenu === menu ? null : menu);
  const refreshData = () => {
    if (system) {
      setSystem(Object.assign(Object.create(Object.getPrototypeOf(system)), system));
    }
  };

  const handleCancel = (patientId) => {
    if (system.cancelPatient(patientId)) {
      setMessage({ type: 'success', text: 'Patient moved to missed list' });
      refreshData();
    }
  };

  const handleRestore = (patientId) => {
    if (system.restorePatient(patientId)) {
      setMessage({ type: 'success', text: 'Patient restored to queue' });
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

  const handleClinicianLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profile = {
      name: formData.get('doctorName'),
      id: formData.get('doctorId'),
      phone: formData.get('doctorPhone'),
      specialization: formData.get('specialization')
    };
    setDoctorProfile(profile);
    setUserRole('clinician');
    setIsLoggedIn(true);
    localStorage.setItem('clinix_role', 'clinician');
    localStorage.setItem('clinix_doctor', JSON.stringify(profile));
  };

  const handlePatientLogin = (e) => {
    e.preventDefault();
    if (!patientQuery.trim()) return;
    const result = system.findPatient(patientQuery);
    if (result && result.patient) {
      setPatientProfile(result.patient);
      setUserRole('patient');
      setIsLoggedIn(true);
      localStorage.setItem('clinix_role', 'patient');
      localStorage.setItem('clinix_patient', JSON.stringify(result.patient));
      setMessage({ type: 'success', text: `Welcome back, ${result.patient.name}!` });
    } else {
      setMessage({ type: 'error', text: 'Patient UID / Phone not found. Register as new patient below.' });
    }
  };

  const handlePatientQuickSelect = (p) => {
    setPatientProfile(p);
    setUserRole('patient');
    setIsLoggedIn(true);
    localStorage.setItem('clinix_role', 'patient');
    localStorage.setItem('clinix_patient', JSON.stringify(p));
    setMessage({ type: 'success', text: `Welcome, ${p.name}!` });
  };

  const handlePatientSelfRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const newP = system.registerPatient(formData.get('name'), formData.get('age'), formData.get('phone'));
      setPatientProfile(newP);
      setUserRole('patient');
      setIsLoggedIn(true);
      localStorage.setItem('clinix_role', 'patient');
      localStorage.setItem('clinix_patient', JSON.stringify(newP));
      setMessage({ type: 'success', text: `Registered successfully! Your UID is ${newP.id}` });
      refreshData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('clinix_role');
    localStorage.removeItem('clinix_doctor');
    localStorage.removeItem('clinix_patient');
    setDoctorProfile({ name: '', id: '', phone: '', specialization: '' });
    setPatientProfile({ id: '', name: '', phone: '', age: '' });
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

  const handlePatientJoinQueue = () => {
    if (!patientProfile || !patientProfile.id) return;
    const isWaiting = system.patients.some(p => p.id === patientProfile.id);
    const isServing = servingPatient && servingPatient.id === patientProfile.id;
    if (isServing || isWaiting) {
      setMessage({ type: 'error', text: 'You are already in active queue!' });
      return;
    }
    const isMissed = system.missed.some(p => p.id === patientProfile.id);
    if (isMissed) {
      system.restorePatient(patientProfile.id);
    } else {
      system.patients.push(patientProfile);
      system.save();
    }
    setMessage({ type: 'success', text: 'Successfully joined consultation queue!' });
    refreshData();
  };

  const handlePatientLeaveQueue = () => {
    if (!patientProfile || !patientProfile.id) return;
    if (system.cancelPatient(patientProfile.id)) {
      setMessage({ type: 'success', text: 'You have left the queue.' });
      refreshData();
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
            <div><p><b>Clinician:</b> Dr. ${doctorProfile.name || 'On Duty Specialist'}</p><p><b>Date:</b> ${new Date(visit.date).toLocaleString('en-IN')}</p></div>
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

  if (!isMounted || !system) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Activity size={64} className="text-[#1a4fbc] animate-pulse" />
          <p className="text-[#1a4fbc] font-black text-2xl tracking-tighter">Initializing Secure EMR Environment...</p>
        </div>
      </div>
    );
  }

  // ===================== LOGIN SCREEN (ROLE SWITCHER) =====================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8faff] font-sans selection:bg-blue-100">
        {/* Left Branding */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-24 py-16 text-slate-900">
          <div className="mb-12">
            <div className="text-4xl font-black tracking-tighter mb-16 flex items-center gap-2 text-[#1a4fbc]">
               <Activity size={32} /> Clinix
            </div>
            <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight text-slate-900">
              Run Your Clinic <br />
              <span className="text-[#1a4fbc]">Smarter.</span> Not Harder.
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-xl leading-relaxed mb-12 font-medium">
              Clinix is the all-in-one powered clinic management system that handles appointments, billing, EMR, prescriptions and patient records.
            </p>
            <div className="space-y-6 mb-16">
              <CheckItem text="Securely store and access patient history" dark={false} />
              <CheckItem text="Digital prescriptions and lab integration" dark={false} />
              <CheckItem text="Real-time patient queue & live EMR sync" dark={false} />
            </div>
          </div>
        </div>

        {/* Right Card with Role Switcher */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[580px] p-8 md:p-14 text-slate-900 z-10 relative border border-blue-50">
            
            {/* Segmented Control Role Selector */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-8 border border-slate-200/60">
              <button
                type="button"
                onClick={() => { setLoginRole('clinician'); setIsNewPatientReg(false); }}
                className={`flex-1 py-3.5 px-4 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                  loginRole === 'clinician'
                    ? 'bg-white text-[#1a4fbc] shadow-md shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Stethoscope size={18} /> Clinician Portal
              </button>
              <button
                type="button"
                onClick={() => { setLoginRole('patient'); setIsNewPatientReg(false); }}
                className={`flex-1 py-3.5 px-4 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                  loginRole === 'patient'
                    ? 'bg-white text-[#1a4fbc] shadow-md shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User size={18} /> Patient Portal
              </button>
            </div>

            {/* CLINICIAN LOGIN FORM */}
            {loginRole === 'clinician' && (
              <div>
                <div className="mb-8 text-center md:text-left">
                  <h3 className="text-3xl font-bold mb-2 tracking-tight">Clinician Portal</h3>
                  <p className="text-slate-500 text-base font-medium leading-relaxed">Fill in the details to access your workstation workspace.</p>
                </div>
                <form onSubmit={handleClinicianLogin} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800">Full Name *</label>
                      <input name="doctorName" required defaultValue="Dr. Sarah Jenkins" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="Dr. Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800">Specialization *</label>
                      <input name="specialization" required defaultValue="General Physician" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="e.g. Cardiologist" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800">Doc ID *</label>
                      <input name="doctorId" required defaultValue="DOC-882" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="DOC-123" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800">Phone *</label>
                      <input name="doctorPhone" required defaultValue="+91 98765 00000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#1a4fbc] text-white py-5 rounded-[20px] font-bold text-lg shadow-lg hover:bg-[#143d9a] transition-all flex items-center justify-center gap-3 active:scale-[0.99]">
                    Enter Dashboard <ArrowRight size={22} />
                  </button>
                </form>
              </div>
            )}

            {/* PATIENT LOGIN / REGISTER FORM */}
            {loginRole === 'patient' && (
              <div>
                {!isNewPatientReg ? (
                  <div>
                    <div className="mb-6 text-center md:text-left">
                      <h3 className="text-3xl font-bold mb-2 tracking-tight">Patient Portal</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">Enter your Patient UID or Mobile Number to access your records & queue.</p>
                    </div>

                    <form onSubmit={handlePatientLogin} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800">Patient UID or Registered Phone *</label>
                        <input
                          value={patientQuery}
                          onChange={(e) => setPatientQuery(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium"
                          placeholder="e.g. P101 or +91 98765 43210"
                        />
                      </div>

                      {/* Quick Select demo pills if patients exist */}
                      {system.patients && system.patients.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quick Demo Select:</p>
                          <div className="flex flex-wrap gap-2">
                            {system.patients.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handlePatientQuickSelect(p)}
                                className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-[#1a4fbc] hover:bg-blue-100 transition-all flex items-center gap-1.5"
                              >
                                <span>{p.name}</span>
                                <span className="text-[10px] opacity-75">({p.id})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" className="w-full bg-[#1a4fbc] text-white py-5 rounded-[20px] font-bold text-lg shadow-lg hover:bg-[#143d9a] transition-all flex items-center justify-center gap-3 active:scale-[0.99]">
                        Access Patient Portal <ArrowRight size={22} />
                      </button>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setIsNewPatientReg(true)}
                          className="text-xs font-bold text-[#1a4fbc] hover:underline"
                        >
                          First time here? Register as a New Patient
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 text-center md:text-left">
                      <h3 className="text-3xl font-bold mb-2 tracking-tight">New Patient Profile</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">Register your identity to join live triage & view health records.</p>
                    </div>

                    <form onSubmit={handlePatientSelfRegister} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800">Full Legal Name *</label>
                        <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="Your Full Name" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800">Age *</label>
                          <input name="age" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="Age" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800">Mobile Phone *</label>
                          <input name="phone" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a4fbc] focus:bg-white outline-none transition-all text-base font-medium" placeholder="+91 98765 43210" />
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-[#1a4fbc] text-white py-4 rounded-[20px] font-bold text-lg shadow-lg hover:bg-[#143d9a] transition-all flex items-center justify-center gap-3 active:scale-[0.99]">
                        Register & Enter Portal <ArrowRight size={22} />
                      </button>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setIsNewPatientReg(false)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline"
                        >
                          Already have a UID? Log in here
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ===================== PATIENT DASHBOARD PORTAL VIEW =====================
  if (userRole === 'patient') {
    const patientData = system.searchPatient(patientProfile.id);
    const history = patientData ? patientData.history : [];
    const waitingPatients = getWaitingPatients();
    
    const isServing = servingPatient && servingPatient.id === patientProfile.id;
    const posIndex = waitingPatients.findIndex(p => p.id === patientProfile.id);
    const isInWaitingQueue = posIndex !== -1;
    const isMissed = system.missed.some(p => p.id === patientProfile.id);

    return (
      <div className="min-h-screen w-full bg-[#f8faff] text-slate-900 flex flex-col font-sans">
        
        {/* Patient Top Header */}
        <header className="bg-white border-b border-blue-100 px-6 md:px-12 py-5 sticky top-0 z-30 shadow-sm">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1a4fbc]">
                <Activity size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#1a4fbc] tracking-tight">Clinix</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span> Patient Portal Access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                <Clock size={16} className="text-[#1a4fbc]" />
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-10 h-10 bg-[#1a4fbc] text-white rounded-xl flex items-center justify-center font-bold text-base shadow-md">
                  {patientProfile.name?.[0] || 'P'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-slate-900 leading-none">{patientProfile.name}</p>
                  <p className="text-[10px] font-bold text-[#1a4fbc] mt-1 uppercase tracking-widest">{patientProfile.id}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Patient Dashboard Content */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-10 space-y-8">
          
          {/* Hero Welcome Banner */}
          <div className="bg-gradient-to-r from-[#1a4fbc] via-blue-600 to-indigo-700 text-white rounded-[36px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold mb-4 border border-white/20">
                  <ShieldCheck size={16} /> Authenticated EMR Record
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                  Welcome back, {patientProfile.name}
                </h2>
                <p className="text-blue-100 text-base md:text-lg max-w-xl font-medium leading-relaxed">
                  Track your live consultation status, access diagnostic impressions, and manage your electronic prescriptions.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-6 self-start md:self-auto">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Patient Identity</p>
                  <p className="text-2xl font-black text-white mt-1">{patientProfile.id}</p>
                </div>
                <div className="h-10 w-px bg-white/20"></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Registered Contact</p>
                  <p className="text-sm font-bold text-white mt-1">{patientProfile.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[28px] border border-blue-50 shadow-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1a4fbc] shrink-0">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Position</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {isServing ? 'In Consultation' : isInWaitingQueue ? `#${posIndex + 1} in Line` : 'Not in Queue'}
                </p>
                <p className="text-[10px] font-bold text-[#1a4fbc] mt-1 uppercase">
                  {isServing ? 'Active Session' : isInWaitingQueue ? `Est. wait ~${(posIndex + 1) * 10} mins` : 'Ready to request'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-blue-50 shadow-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded EMR Visits</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{history.length} Visits</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Verified Records</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-blue-50 shadow-xl flex items-center gap-5">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                <Stethoscope size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Clinician</p>
                <p className="text-xl font-black text-slate-900 mt-1 truncate max-w-[180px]">
                  Dr. {doctorProfile.name || 'Sarah Jenkins'}
                </p>
                <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase">
                  {doctorProfile.specialization || 'General Physician'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left 2 Cols: Live Queue Ticket & History */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Live Consultation Queue Status Card */}
              <section className="bg-white rounded-[32px] border border-blue-100 p-8 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#1a4fbc] animate-ping"></div>
                    <h3 className="text-xl font-black tracking-tight">Live Consultation Status</h3>
                  </div>
                  <button
                    onClick={refreshData}
                    className="p-2 text-slate-400 hover:text-[#1a4fbc] hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                  >
                    <RefreshCw size={16} /> Sync Queue
                  </button>
                </div>

                {isServing ? (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg animate-bounce">
                        <Stethoscope size={28} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-200/80 px-2.5 py-1 rounded-md text-emerald-900">Session Active</span>
                        <h4 className="text-2xl font-black mt-2">Consultation in Progress!</h4>
                        <p className="text-xs font-bold text-emerald-700 mt-1">Please enter Room #1 to meet Dr. {doctorProfile.name || 'Sarah'}.</p>
                      </div>
                    </div>
                  </div>
                ) : isInWaitingQueue ? (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#1a4fbc] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                        #{posIndex + 1}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-[#1a4fbc] px-2.5 py-1 rounded-md">Queue Active</span>
                        <h4 className="text-xl font-black mt-2 text-slate-900">You are #{posIndex + 1} in the queue</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">Estimated wait time: ~{(posIndex + 1) * 10} minutes</p>
                      </div>
                    </div>

                    <button
                      onClick={handlePatientLeaveQueue}
                      className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-black text-xs hover:bg-rose-50 transition-all shrink-0"
                    >
                      Leave Queue
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-100/60 rounded-full flex items-center justify-center text-[#1a4fbc] mb-4">
                      <Plus size={32} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Not Currently in Queue</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1 mb-6 max-w-md">
                      Would you like to join today’s consultation queue to visit the doctor?
                    </p>
                    <button
                      onClick={handlePatientJoinQueue}
                      className="bg-[#1a4fbc] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-[#143d9a] transition-all flex items-center gap-2"
                    >
                      <Plus size={18} /> Join Today’s Consultation Queue
                    </button>
                  </div>
                )}
              </section>

              {/* Electronic Medical Records Timeline */}
              <section className="bg-white rounded-[32px] border border-blue-100 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <FileText className="text-[#1a4fbc]" size={22} /> Medical History & Prescriptions
                  </h3>
                  <span className="text-xs font-bold bg-blue-50 text-[#1a4fbc] px-3 py-1.5 rounded-lg border border-blue-100">
                    {history.length} Verified Records
                  </span>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-6">
                    {[...history].reverse().map((visit, idx) => (
                      <div key={idx} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:border-blue-300 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <span className="text-xs font-black text-[#1a4fbc] uppercase tracking-wider">
                            Visit Date: {new Date(visit.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}
                          </span>
                          <button
                            onClick={() => handlePrint(patientProfile, visit)}
                            className="px-4 py-2 bg-white text-[#1a4fbc] border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-2 self-start sm:self-auto"
                          >
                            <Printer size={16} /> Print EMR Statement
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Impression / Diagnosis</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{visit.diagnosis}</p>
                        </div>
                        <div className="bg-blue-50/60 p-4 rounded-xl border-l-4 border-[#1a4fbc]">
                          <p className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest">Prescribed Pharmacotherapy Directive</p>
                          <p className="text-sm font-bold text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                            {visit.prescription}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">No electronic medical history recorded yet.</p>
                    <p className="text-slate-400 text-xs mt-1">Your doctor will update your EMR prescriptions after consultation.</p>
                  </div>
                )}
              </section>

            </div>

            {/* Right 1 Col: Patient Card Info & Clinic Details */}
            <div className="space-y-8">
              
              {/* Patient Identity Card */}
              <section className="bg-white rounded-[32px] border border-blue-100 p-6 shadow-xl">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Patient Health Card</h4>
                
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-400 font-black uppercase">Clinix Health Pass</p>
                      <h5 className="text-xl font-black mt-1 text-white">{patientProfile.name}</h5>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                      {patientProfile.name?.[0]}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-700/80 pt-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Patient UID</p>
                      <p className="text-base font-black text-blue-400 mt-0.5">{patientProfile.id}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Age</p>
                      <p className="text-base font-black text-white mt-0.5">{patientProfile.age} Years</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-700/80 pt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Emergency Contact</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{patientProfile.phone}</p>
                  </div>
                </div>
              </section>

              {/* Clinic Support Info */}
              <section className="bg-white rounded-[32px] border border-blue-100 p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Clinic Information</h4>
                
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-[#1a4fbc] shrink-0">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Dr. {doctorProfile.name || 'Sarah Jenkins'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{doctorProfile.specialization || 'Senior Consultant'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Clinic Reception Hotline</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">+91 1800-CLINIX-EMR</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">OPD Consultation Hours</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Mon - Sat: 09:00 AM - 07:00 PM</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>

          </div>

        </main>

        {/* Toast */}
        {message && (
          <div className="fixed bottom-10 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 px-8 py-4 rounded-2xl shadow-2xl z-[200] flex items-center gap-4 text-[#1a4fbc] font-black animate-in slide-in-from-bottom bg-white border border-blue-100">
             {message.type === 'error' ? <X className="text-rose-500" /> : <CheckCircle2 className="text-emerald-500" />}
             <span className="text-sm uppercase tracking-tight">{message.text}</span>
          </div>
        )}
      </div>
    );
  }

  // ===================== CLINICIAN DASHBOARD VIEW =====================
  const waitingPatients = getWaitingPatients();
  const frequentVisitors = system.getFrequentVisitors(1);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8faff] text-slate-900">
      
      {/* Sidebar - Modern Light */}
      <aside className="hidden md:flex w-[88px] bg-white border-r border-blue-100 flex-col items-center py-10 shrink-0 z-20 shadow-sm">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-16 shadow-sm">
          <Activity size={28} className="text-[#1a4fbc]" />
        </div>
        <div className="flex flex-col gap-10 w-full items-center">
          <SideIcon icon={<Home size={24} />} active={activeTab === 'home'} label="EMR" onClick={() => setActiveTab('home')} />
          <SideIcon icon={<Plus size={24} />} active={activeTab === 'register'} label="Register" onClick={() => setActiveTab('register')} />
          <SideIcon icon={<FileText size={24} />} active={activeTab === 'history'} label="History" onClick={() => setActiveTab('history')} />
          <SideIcon icon={<BarChart3 size={24} />} active={activeTab === 'reports'} label="Reports" onClick={() => setActiveTab('reports')} />
        </div>
        <button onClick={handleLogout} className="mt-auto p-4 text-slate-400 hover:text-rose-500 transition-colors" title="Logout"><LogOut size={24} /></button>
      </aside>

      {/* Mobile Navigation */}
      <aside className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex justify-around items-center z-50 px-2 shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><Home size={22} /> EMR</button>
        <button onClick={() => setActiveTab('register')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'register' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><Plus size={22} /> Add</button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'history' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><FileText size={22} /> Records</button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'reports' ? 'text-[#1a4fbc] bg-blue-50' : 'text-slate-400'}`}><BarChart3 size={22} /> Stats</button>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-24 md:pb-0 relative">
        
        {/* Header - Clean Light */}
        <div className="bg-white border-b border-blue-100 px-6 md:px-12 py-6 shrink-0 z-10 sticky top-0 shadow-sm">
          <header className="flex justify-between items-center max-w-[1600px] mx-auto w-full">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-[#1a4fbc]">Clinix</h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Dr. {doctorProfile.name} • Electronic Medical Records
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8">
              <form onSubmit={handleSearch} className="relative hidden lg:block w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" placeholder="Authorized Patient Search..." value={searchId} onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 border border-slate-200 transition-all font-medium"
                />
              </form>
              <div className="flex items-center gap-3">
                <HeaderAction icon={<Bell size={20} />} onClick={() => toggleMenu('notifications')} active={activeMenu === 'notifications'} />
                <HeaderAction icon={<Settings size={20} />} onClick={() => toggleMenu('settings')} active={activeMenu === 'settings'} />
                <div className="relative">
                  <button onClick={() => toggleMenu('profile')} className="w-10 h-10 bg-[#1a4fbc] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all">
                    {doctorProfile.name[0]}
                  </button>
                  {activeMenu === 'profile' && (
                    <div className="absolute right-0 mt-4 w-72 bg-white border border-blue-100 rounded-3xl shadow-2xl p-6 z-[100] text-slate-900 animate-in slide-in-from-top-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Clinician Profile</h4>
                       <div className="space-y-5">
                          <ProfileRow label="Authorization" value={doctorProfile.specialization || "Senior Consultant"} />
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

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full flex flex-col xl:flex-row gap-10 items-start">
          
          <div className="flex-1 w-full space-y-10">
            
            {activeTab === 'home' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Live Triage" value={waitingPatients.length} subLabel="Active queue" icon={<Users size={24} className="text-[#1a4fbc]" />} />
                  <StatCard label="Monthly EMR" value={system.getTotalVisitsThisMonth()} subLabel="Records created" icon={<Layers size={24} className="text-emerald-500" />} />
                  <div className="bg-white border border-blue-100 rounded-[28px] p-6 shadow-xl flex flex-col justify-between overflow-hidden relative group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">EMR Station Time</p>
                    <p className="text-3xl font-black mt-2 tracking-tight text-[#1a4fbc]">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">{currentTime.toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a4fbc]/50 mb-5 flex items-center gap-3 ml-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#1a4fbc]"></div> Active Station Console
                  </h3>
                  <DoctorCard 
                    name={doctorProfile.name} isServing={!!servingPatient} patient={servingPatient} onStart={startConsultation} onComplete={() => setShowVisitModal(true)}
                  />
                </section>

                <section className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a4fbc]/50 flex items-center gap-3 ml-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Electronic Triage List
                    </h3>
                    <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-blue-100">
                      <TabBtn active={queueTab === 'upcoming'} onClick={() => setQueueTab('upcoming')}>Active ({waitingPatients.length})</TabBtn>
                      <TabBtn active={queueTab === 'missed'} onClick={() => setQueueTab('missed')}>No Show ({system.missed.length})</TabBtn>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(queueTab === 'upcoming' ? waitingPatients : system.missed).map((p, i) => (
                      <QueueItem key={p.id} patient={p} index={i} qNum={101 + i} onCancel={() => handleCancel(p.id)} onRestore={() => handleRestore(p.id)} isMissed={queueTab === 'missed'} />
                    ))}
                    {((queueTab === 'upcoming' && waitingPatients.length === 0) || (queueTab === 'missed' && system.missed.length === 0)) && (
                      <div className="bg-white border-2 border-dashed border-blue-50 rounded-[28px] py-24 text-center">
                         <p className="text-blue-200 font-bold uppercase tracking-widest text-sm">No electronic records found.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'register' && (
              <section className="bg-white rounded-[32px] border border-blue-100 shadow-xl max-w-xl mx-auto w-full overflow-hidden mt-10">
                <div className="bg-blue-50 p-10 text-[#1a4fbc] text-center border-b border-blue-100">
                   <h3 className="text-3xl font-black tracking-tight">Record Initiation</h3>
                   <p className="text-slate-500 font-medium mt-2">Initialize new secure medical history profile.</p>
                </div>
                <form onSubmit={handleRegister} className="p-10 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest ml-1">Patient Identity</label>
                      <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900" placeholder="Patient's Full Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest ml-1">Legal Age</label>
                        <input name="age" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900" placeholder="Age" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-widest ml-1">Mobile Contact</label>
                        <input name="phone" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-5 outline-none focus:border-[#1a4fbc] transition-all font-bold text-lg text-slate-900" placeholder="Phone" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#1a4fbc] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/10 hover:bg-[#143d9a] transition-all active:scale-95">Assign Medical UID</button>
                </form>
              </section>
            )}

            {activeTab === 'history' && (
              <section className="bg-white rounded-[32px] border border-blue-100 shadow-xl overflow-hidden min-h-[500px]">
                {searchResult ? (
                  <div className="p-8">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-3xl text-[#1a4fbc] shadow-inner">{searchResult.patient.name[0]}</div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{searchResult.patient.name}</h3>
                        <p className="text-[#1a4fbc] font-black mt-1 text-sm uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md inline-block">{searchResult.patient.id}</p>
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
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1a4fbc] shadow-inner"><Search size={48} /></div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Record Intelligence</h3>
                    <p className="text-slate-500 font-medium mt-2">Authorize record access by entering a valid UID.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard title="EMR Record Pulse" value={system.getTotalVisitsThisMonth()} trend="+12%" description="Aggregate monthly throughput of verified electronic records." icon={<Activity size={28} className="text-[#1a4fbc]" />} />
                <div className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-xl">
                  <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#1a4fbc]" /> Frequent Cohorts
                  </h3>
                  <div className="space-y-3">
                    {frequentVisitors.length > 0 ? frequentVisitors.map(v => (
                      <div key={v.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl text-slate-900 border border-slate-100">
                        <span className="font-black text-sm">{v.name}</span>
                        <span className="text-[10px] font-black bg-white text-[#1a4fbc] px-3 py-1.5 rounded-lg shadow-sm border border-blue-50 uppercase">Verified Patient</span>
                      </div>
                    )) : <p className="text-slate-400 italic text-center py-10 uppercase tracking-widest text-[10px]">Statistical data pending.</p>}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Billing Side */}
          <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a4fbc]/50 flex items-center gap-3 ml-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#1a4fbc] animate-pulse"></div> Station Billing
            </h3>
            <div className="space-y-5">
              {system.visits.slice(-5).reverse().map((v, i) => (
                <CheckoutCard key={i} visit={v} patient={system.patients.find(p => p.id === v.patientId)} onPrint={handlePrint} doctorName={doctorProfile.name} />
              ))}
              {system.visits.length === 0 && (
                 <div className="bg-white border border-blue-100 rounded-[28px] p-16 text-center shadow-lg">
                   <FileText size={32} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No pending transactions</p>
                 </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Modal: Record Finalization */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-200/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 border border-blue-50">
             <div className="p-8 bg-[#1a4fbc] text-white flex justify-between items-center">
                <div><h3 className="text-xl font-black tracking-tight uppercase">EMR Session Finalization</h3><p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Authorized Medical Signature Required</p></div>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleCompleteConsultation} className="p-8 space-y-6">
               <div className="space-y-5">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Impression</label><input name="diag" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-[#1a4fbc] font-bold text-sm text-slate-900" placeholder="Enter diagnosis..." /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pharmacotherapy directive</label><textarea name="rx" required rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none resize-none font-bold text-sm text-slate-900" placeholder="Enter dosage, frequency..." /></div>
               </div>
               <button className="w-full bg-[#1a4fbc] text-white py-5 rounded-xl font-black shadow-xl shadow-blue-500/10 active:scale-95 transition-all">Sign & Finalize Record</button>
             </form>
           </div>
        </div>
      )}

      {/* Toast */}
      {message && (
        <div className="fixed bottom-28 md:bottom-12 right-1/2 translate-x-1/2 md:translate-x-0 md:right-12 px-8 py-4 rounded-2xl shadow-2xl z-[200] flex items-center gap-4 text-[#1a4fbc] font-black animate-in slide-in-from-bottom bg-white border border-blue-100">
           {message.type === 'error' ? <X className="text-rose-500" /> : <CheckCircle2 className="text-emerald-500" />} <span className="text-sm uppercase tracking-tight">{message.text}</span>
        </div>
      )}
    </div>
  );
}

function CheckItem({ text, dark = false }) {
  return (
    <div className="flex items-center gap-5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${dark ? 'bg-white/10 border-white/10' : 'bg-blue-50 border-blue-100'}`}><Check size={18} strokeWidth={4} className={dark ? 'text-white' : 'text-[#1a4fbc]'} /></div>
      <p className={`text-xl font-bold ${dark ? 'text-blue-50' : 'text-slate-600'}`}>{text}</p>
    </div>
  );
}

function SideIcon({ icon, active, onClick, label }) {
  return (
    <button onClick={onClick} className={`relative p-4 rounded-xl transition-all ${active ? 'bg-blue-50 text-[#1a4fbc] shadow-sm scale-110' : 'text-slate-400 hover:text-[#1a4fbc] hover:bg-blue-50/50'}`} title={label}>{icon}</button>
  );
}

function HeaderAction({ icon, onClick, active }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl transition-all relative ${active ? 'bg-blue-50 text-[#1a4fbc] shadow-inner' : 'text-slate-400 hover:text-[#1a4fbc] hover:bg-blue-50/50'}`}>{icon}</button>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-800 leading-none">{value}</span>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-blue-50 text-[#1a4fbc] shadow-sm' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, subLabel, icon }) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-blue-50 shadow-xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
       <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 shadow-inner">{icon}</div>
       <div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-3xl font-black tracking-tight text-slate-900 mt-1">{value}</p>
         <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-2">{subLabel}</p>
       </div>
    </div>
  );
}

function DoctorCard({ name, isServing, patient, onStart, onComplete }) {
  return (
    <div className="bg-white rounded-[28px] p-8 border border-blue-100 shadow-xl flex flex-col lg:flex-row gap-8 items-center text-slate-900 relative overflow-hidden transition-all">
      <div className={`absolute left-0 top-0 w-1.5 h-full ${isServing ? 'bg-emerald-500' : 'bg-[#1a4fbc]'}`}></div>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-white shadow-xl flex items-center justify-center font-black text-3xl text-[#1a4fbc]">{name[0]}</div>
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
          <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100 shadow-inner">
            <p className="text-[8px] font-black text-[#1a4fbc] uppercase tracking-widest mb-2">Authenticated Patient</p>
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

function QueueItem({ patient, index, qNum, onCancel, onRestore, isMissed }) {
  return (
    <div className="bg-white border border-blue-50 p-5 rounded-[28px] flex items-center justify-between group transition-all hover:border-[#1a4fbc]/30 hover:shadow-xl">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-black text-lg text-[#1a4fbc]/30 group-hover:text-[#1a4fbc] transition-all shadow-inner">{index + 1}</div>
        <div>
          <div className="flex items-center gap-3">
            <p className="font-black text-lg text-slate-900 leading-none">{patient.name}</p>
            <span className="text-[9px] font-black bg-blue-50 text-[#1a4fbc] px-2 py-1 rounded-md uppercase tracking-tighter leading-none border border-blue-100/50">{patient.id}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{patient.age} Yrs • {patient.phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden sm:block">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">REF ID</p>
           <p className="text-base font-black text-slate-900 mt-1 leading-none">#{qNum}</p>
        </div>
        {!isMissed ? (
          <button onClick={onCancel} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-slate-100">
            <X size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-rose-50 text-rose-500 text-[9px] font-black rounded-lg uppercase border border-rose-100 tracking-widest">No Show</div>
            <button onClick={onRestore} className="px-4 py-2 bg-[#1a4fbc] text-white text-[9px] font-black rounded-lg uppercase shadow-lg shadow-blue-500/20 hover:bg-[#143d9a] transition-all">Let In</button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ visit }) {
  return (
    <div className="relative pl-12 pb-10 group last:pb-0">
      <div className="absolute left-0 top-0 w-8 h-8 bg-white rounded-xl border-2 border-blue-100 flex items-center justify-center z-10 text-[#1a4fbc] group-hover:scale-110 transition-all"><FileText size={16} /></div>
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-50 rounded-full group-last:hidden"></div>
      <div className="bg-white border border-blue-50 rounded-[28px] p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-black text-[#1a4fbc] uppercase tracking-[0.2em]">{new Date(visit.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span><span className="text-[10px] font-black text-slate-300 uppercase leading-none">{new Date(visit.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <p className="text-xl font-black tracking-tight leading-none text-slate-900">{visit.diagnosis}</p>
        <div className="bg-blue-50/30 p-5 rounded-2xl border-l-[4px] border-[#1a4fbc] mt-5">
           <p className="text-[8px] font-black text-[#1a4fbc]/60 uppercase tracking-widest mb-1">Electronic Prescription</p>
           <p className="text-sm font-bold italic text-slate-700 leading-relaxed">"{visit.prescription}"</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, trend, description, icon }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-xl group hover:translate-y-[-4px] transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1a4fbc] group-hover:scale-110 transition-all shadow-inner">{icon}</div>
        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border-2 border-emerald-100 leading-none">{trend}</span>
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <div className="text-6xl font-black mt-3 tracking-tighter leading-none text-slate-900">{value}</div>
      <p className="text-xs text-slate-500 mt-6 leading-relaxed font-medium uppercase tracking-tight">{description}</p>
    </div>
  );
}

function CheckoutCard({ visit, patient, onPrint, doctorName }) {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-blue-100 shadow-xl transition-all hover:shadow-2xl animate-in slide-in-from-right-10 duration-500 text-slate-900">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a4fbc] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shrink-0">{patient?.name?.[0] || 'P'}</div>
          <div><p className="text-base font-black leading-none truncate">{patient?.name || 'UID Unknown'}</p><p className="text-[9px] text-slate-400 font-black mt-1.5 uppercase leading-none tracking-widest">{patient?.id}</p></div>
        </div>
        <button onClick={() => onPrint(patient, visit)} className="p-2.5 bg-blue-50 text-[#1a4fbc] rounded-lg border border-blue-100 hover:scale-110 transition-all"><FileText size={18} /></button>
      </div>
      <div className="bg-blue-50/30 p-4 rounded-xl mb-6 border border-blue-100/50">
        <span className="text-[8px] font-black text-[#1a4fbc]/60 uppercase tracking-widest block mb-1 leading-none">Diagnostic Summary</span>
        <p className="text-[11px] font-bold leading-relaxed truncate text-slate-600">{visit.diagnosis}</p>
      </div>
      <div className="flex items-center justify-between pt-5 border-t-2 border-dashed border-blue-50">
        <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Record Fee</p><p className="text-xl font-black text-[#1a4fbc] mt-1.5 tracking-tight leading-none">₹500.00</p></div>
        <button onClick={() => onPrint(patient, visit)} className="bg-[#1a4fbc] text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-blue-500/10 hover:bg-[#143d9a] active:scale-95 transition-all">FINALIZE & PRINT</button>
      </div>
    </div>
  );
}
