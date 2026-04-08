
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
            const patient = this.patients.find(p => p.id === id);
            return {
                ...patient,
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

    save() {
        if (typeof window !== 'undefined' || global.localStorage) {
            const storage = typeof window !== 'undefined' ? localStorage : global.localStorage;
            storage.setItem('clinic_patients', JSON.stringify(this.patients));
            storage.setItem('clinic_visits', JSON.stringify(this.visits));
        }
    }

    load() {
        if (typeof window !== 'undefined' || global.localStorage) {
            const storage = typeof window !== 'undefined' ? localStorage : global.localStorage;
            const savedPatients = storage.getItem('clinic_patients');
            const savedVisits = storage.getItem('clinic_visits');

            if (savedPatients) {
                const rawPatients = JSON.parse(savedPatients);
                this.patients = rawPatients.map(p => new Patient(p.id, p.name, p.age, p.phone));
            }
            if (savedVisits) {
                const rawVisits = JSON.parse(savedVisits);
                this.visits = rawVisits.map(v => new Visit(v.patientId, v.date, v.diagnosis, v.prescription));
            }
        }
    }
}

export { HospitalSystem, Patient, Visit };
