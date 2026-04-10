
#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <iomanip>
#include <algorithm>

using namespace std;

// Class Patient: Store individual patient data
class Patient {
public:
    string id;
    string name;
    int age;
    string phone;

    Patient(string id, string name, int age, string phone) 
        : id(id), name(name), age(age), phone(phone) {}

    // Method to display patient details
    void display() const {
        cout << "ID: " << id << " | Name: " << name << " | Age: " << age << " | Phone: " << phone << endl;
    }
};

// Class Visit: Store visit details for a patient
class Visit {
public:
    string patientId;
    string date;
    string diagnosis;
    string prescription;

    Visit(string patientId, string date, string diagnosis, string prescription)
        : patientId(patientId), date(date), diagnosis(diagnosis), prescription(prescription) {}

    // Method to display visit record
    void display() const {
        cout << "  - Date: " << date << " | Diagnosis: " << diagnosis << " | Rx: " << prescription << endl;
    }
};

// Class HospitalSystem: Manager class using vectors and file storage
class HospitalSystem {
private:
    vector<Patient> patients;
    vector<Visit> visits;
    const string PATIENT_FILE = "patients.txt";
    const string VISIT_FILE = "visits.txt";

public:
    HospitalSystem() {
        loadData();
    }

    // Register a new patient
    void registerPatient(string name, int age, string phone) {
        string nextId = "P" + to_string(101 + patients.size());
        Patient p(nextId, name, age, phone);
        patients.push_back(p);
        saveData();
        cout << "SUCCESS: Registered Patient " << name << " with ID: " << nextId << endl;
    }

    // Add a visit record
    bool addVisit(string patientId, string date, string diagnosis, string prescription) {
        // Validation: Ensure patient exists
        bool found = false;
        for (const auto& p : patients) {
            if (p.id == patientId) {
                found = true;
                break;
            }
        }

        if (!found) {
            cout << "ERROR: Patient ID " << patientId << " not found!" << endl;
            return false;
        }

        Visit v(patientId, date, diagnosis, prescription);
        visits.push_back(v);
        saveData();
        cout << "SUCCESS: Visit recorded for " << patientId << endl;
        return true;
    }

    // Search and show history
    void searchPatient(string patientId) {
        bool found = false;
        for (const auto& p : patients) {
            if (p.id == patientId) {
                p.display();
                cout << "--- Visit History ---" << endl;
                bool hasVisits = false;
                for (const auto& v : visits) {
                    if (v.patientId == patientId) {
                        v.display();
                        hasVisits = true;
                    }
                }
                if (!hasVisits) cout << "No visits found." << endl;
                found = true;
                break;
            }
        }
        if (!found) cout << "ERROR: Patient ID " << patientId << " not found." << endl;
    }

    // Report: Frequent visitors (more than N visits)
    void showFrequentVisitors(int n) {
        cout << "--- Frequent Visitors (> " << n << " visits) ---" << endl;
        for (const auto& p : patients) {
            int count = 0;
            for (const auto& v : visits) {
                if (v.patientId == p.id) count++;
            }
            if (count > n) {
                cout << p.name << " (ID: " << p.id << ") - Visits: " << count << endl;
            }
        }
    }

    // Persistence: Save to File
    void saveData() {
        ofstream pFile(PATIENT_FILE);
        for (const auto& p : patients) {
            pFile << p.id << "|" << p.name << "|" << p.age << "|" << p.phone << endl;
        }
        pFile.close();

        ofstream vFile(VISIT_FILE);
        for (const auto& v : visits) {
            vFile << v.patientId << "|" << v.date << "|" << v.diagnosis << "|" << v.prescription << endl;
        }
        vFile.close();
    }

    // Persistence: Load from File
    void loadData() {
        ifstream pFile(PATIENT_FILE);
        string id, name, phone, line;
        int age;
        while (getline(pFile, line)) {
            // Simplified parsing for school assignment
            size_t pos1 = line.find('|');
            size_t pos2 = line.find('|', pos1 + 1);
            size_t pos3 = line.find('|', pos2 + 1);

            id = line.substr(0, pos1);
            name = line.substr(pos1 + 1, pos2 - pos1 - 1);
            age = stoi(line.substr(pos2 + 1, pos3 - pos2 - 1));
            phone = line.substr(pos3 + 1);
            patients.push_back(Patient(id, name, age, phone));
        }
        pFile.close();

        ifstream vFile(VISIT_FILE);
        string pid, date, diag, presc;
        while (getline(vFile, line)) {
            size_t pos1 = line.find('|');
            size_t pos2 = line.find('|', pos1 + 1);
            size_t pos3 = line.find('|', pos2 + 1);

            pid = line.substr(0, pos1);
            date = line.substr(pos1 + 1, pos2 - pos1 - 1);
            diag = line.substr(pos2 + 1, pos3 - pos2 - 1);
            presc = line.substr(pos3 + 1);
            visits.push_back(Visit(pid, date, diag, presc));
        }
        vFile.close();
    }
};

int main() {
    HospitalSystem system;
    int choice;

    while (true) {
        cout << "\n=== Clinic Registry (C++ OOP) ===\n";
        cout << "1. Register Patient\n";
        cout << "2. Add Visit Record\n";
        cout << "3. Search Patient History\n";
        cout << "4. Frequent Visitors Report\n";
        cout << "5. Exit\n";
        cout << "Choose Option: ";
        cin >> choice;

        if (choice == 1) {
            string name, phone;
            int age;
            cout << "Enter Name: "; cin.ignore(); getline(cin, name);
            cout << "Enter Age: "; cin >> age;
            cout << "Enter Phone: "; cin.ignore(); getline(cin, phone);
            system.registerPatient(name, age, phone);
        } 
        else if (choice == 2) {
            string id, date, diag, presc;
            cout << "Enter Patient ID: "; cin >> id;
            cout << "Enter Date (YYYY-MM-DD): "; cin >> date;
            cout << "Enter Diagnosis: "; cin.ignore(); getline(cin, diag);
            cout << "Enter Prescription: "; getline(cin, presc);
            system.addVisit(id, date, diag, presc);
        }
        else if (choice == 3) {
            string id;
            cout << "Enter Patient ID: "; cin >> id;
            system.searchPatient(id);
        }
        else if (choice == 4) {
            system.showFrequentVisitors(2); // Show frequent if visits > 2
        }
        else if (choice == 5) {
            break;
        }
    }

    return 0;
}
