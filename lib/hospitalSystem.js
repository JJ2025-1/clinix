
class Patient {
    constructor(id, name, age, phone) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.phone = phone;
    }
}

class Visit {
    constructor(patientId, date, diagnosis, prescription) {
        this.patientId = patientId;
        this.date = date; // Expects ISO string or Date object
        this.diagnosis = diagnosis;
        this.prescription = prescription;
    }
}

class HospitalSystem {
    constructor() {
        this.patients = [];
        this.visits = [];
        this.missed = [];
        this.load();
    }

    registerPatient(name, age, phone) {
        // Generate a simple unique ID (e.g., P101, P102, etc.)
        const nextId = this.patients.length > 0 
            ? `P${parseInt(this.patients[this.patients.length - 1].id.slice(1)) + 1}`
            : 'P101';
        
        const newPatient = new Patient(nextId, name, age, phone);
        this.patients.push(newPatient);
        this.save();
        return newPatient;
    }

    cancelPatient(patientId) {
        const index = this.patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            const patient = this.patients[index];
            if (!this.missed.some(p => p.id === patientId)) {
                this.missed.push(patient);
            }
            this.patients.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    restorePatient(patientId) {
        const index = this.missed.findIndex(p => p.id === patientId);
        if (index !== -1) {
            const patient = this.missed[index];
            if (!this.patients.some(p => p.id === patientId)) {
                this.patients.push(patient);
            }
            this.missed.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    addVisit(patientId, date, diagnosis, prescription) {
        // Validate patient exists
        const patientExists = this.patients.some(p => p.id === patientId);
        if (!patientExists) {
            throw new Error(`Patient with ID ${patientId} not found.`);
        }

        const newVisit = new Visit(patientId, date, diagnosis, prescription);
        this.visits.push(newVisit);
        this.save();
        return newVisit;
    }

    searchPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return null;

        const history = this.visits.filter(v => v.patientId === patientId);
        return { patient, history };
    }

    getFrequentVisitors(n) {
        const visitCounts = {};
        this.visits.forEach(v => {
            visitCounts[v.patientId] = (visitCounts[v.patientId] || 0) + 1;
        });

        const frequentIds = Object.keys(visitCounts).filter(id => visitCounts[id] > n);
        return frequentIds.map(id => {
            const patient = this.patients.find(p => p.id === id) || this.missed.find(p => p.id === id);
            return {
                id,
                name: patient ? patient.name : 'Unknown Patient',
                visitCount: visitCounts[id]
            };
        });
    }

    getTotalVisitsThisMonth() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.visits.filter(v => {
            const vDate = new Date(v.date);
            return vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear;
        }).length;
    }

    findPatient(query) {
        if (!query) return null;
        const q = query.trim().toUpperCase();
        let patient = this.patients.find(p => p.id.toUpperCase() === q || p.phone.includes(query.trim()) || p.name.toUpperCase().includes(q));
        if (!patient) {
            patient = this.missed.find(p => p.id.toUpperCase() === q || p.phone.includes(query.trim()) || p.name.toUpperCase().includes(q));
        }
        if (!patient) return null;
        const history = this.visits.filter(v => v.patientId === patient.id);
        return { patient, history };
    }

    save() {
        if (typeof localStorage !== 'undefined') {
            const storage = localStorage;
            storage.setItem('clinic_patients', JSON.stringify(this.patients));
            storage.setItem('clinic_visits', JSON.stringify(this.visits));
            storage.setItem('clinic_missed', JSON.stringify(this.missed));
        }
    }

    load() {
        if (typeof localStorage !== 'undefined') {
            const storage = localStorage;
            const savedPatients = storage.getItem('clinic_patients');
            const savedVisits = storage.getItem('clinic_visits');
            const savedMissed = storage.getItem('clinic_missed');

            if (savedPatients) {
                const rawPatients = JSON.parse(savedPatients);
                this.patients = rawPatients.map(p => new Patient(p.id, p.name, p.age, p.phone));
            } else {
                // Seed initial demo data for rich demo experience
                this.patients = [
                    new Patient('P101', 'Rahul Sharma', 34, '+91 98765 43210'),
                    new Patient('P102', 'Priya Patel', 28, '+91 98765 43211'),
                    new Patient('P103', 'Amit Verma', 45, '+91 98765 43212')
                ];
            }

            if (savedVisits) {
                const rawVisits = JSON.parse(savedVisits);
                this.visits = rawVisits.map(v => new Visit(v.patientId, v.date, v.diagnosis, v.prescription));
            } else {
                this.visits = [
                    new Visit('P101', new Date(Date.now() - 86400000 * 2).toISOString(), 'Acute Upper Respiratory Tract Infection', 'Paracetamol 500mg TDS x 5 days\nAmoxicillin 500mg BD x 5 days\nRest and warm fluids'),
                    new Visit('P102', new Date(Date.now() - 86400000 * 5).toISOString(), 'Mild Hypertension & Fatigue', 'Amlodipine 5mg OD\nMultivitamin 1 tab daily\nReduce sodium intake')
                ];
            }

            if (savedMissed) {
                const rawMissed = JSON.parse(savedMissed);
                this.missed = rawMissed.map(p => new Patient(p.id, p.name, p.age, p.phone));
            }
        }
    }
}

export { HospitalSystem, Patient, Visit };
