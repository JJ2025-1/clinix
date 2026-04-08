
// Simple Node.js test for HospitalSystem logic
// Mocks localStorage for Node environment

global.localStorage = {
    _data: {},
    setItem(key, value) { this._data[key] = value; },
    getItem(key) { return this._data[key] || null; }
};

// Next.js uses '@' alias, but for Node we use relative path
import { HospitalSystem } from '../lib/hospitalSystem.js';

function runTests() {
    console.log("Running HospitalSystem Tests...");
    const system = new HospitalSystem();

    // 1. Register Patient
    console.log("- Testing Registration...");
    const p1 = system.registerPatient("John Doe", 30, "123-456");
    const p2 = system.registerPatient("Jane Smith", 25, "987-654");
    
    if (p1.id === "P101" && p2.id === "P102") {
        console.log("✅ Registration & ID generation passed.");
    } else {
        console.error("❌ Registration failed IDs:", p1.id, p2.id);
    }

    // 2. Add Visit
    console.log("- Testing Add Visit...");
    system.addVisit("P101", new Date().toISOString(), "Fever", "Paracetamol");
    system.addVisit("P101", new Date().toISOString(), "Cough", "Syrup");
    system.addVisit("P101", new Date().toISOString(), "Checkup", "Vitamin");
    
    const history = system.searchPatient("P101").history;
    if (history.length === 3) {
        console.log("✅ Visit history passed.");
    } else {
        console.error("❌ Visit history count mismatch:", history.length);
    }

    // 3. Reports
    console.log("- Testing Reports...");
    const frequent = system.getFrequentVisitors(2); // > 2 visits
    if (frequent.length === 1 && frequent[0].id === "P101") {
        console.log("✅ Frequent visitors report passed.");
    } else {
        console.error("❌ Frequent visitors report failed.");
    }

    const monthly = system.getTotalVisitsThisMonth();
    if (monthly === 3) {
        console.log("✅ Monthly total report passed.");
    } else {
        console.error("❌ Monthly total report failed:", monthly);
    }

    // 4. Persistence Mock
    console.log("- Testing Persistence (Mock)...");
    const system2 = new HospitalSystem();
    if (system2.patients.length === 2 && system2.visits.length === 3) {
        console.log("✅ Persistence passed.");
    } else {
        console.error("❌ Persistence failed. Counts:", system2.patients.length, system2.visits.length);
    }

    console.log("Tests Completed!");
}

try {
    runTests();
} catch (err) {
    console.error("Tests failed with error:", err.message);
}
