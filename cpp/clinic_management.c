#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define PATIENT_FILE "patients.bin"
#define VISIT_FILE "visits.bin"

typedef struct {
    char id[10];
    char name[50];
    int age;
    char phone[15];
} Patient;

typedef struct {
    char patientId[10];
    char date[11]; // YYYY-MM-DD
    char diagnosis[100];
    char prescription[200];
} Visit;

void registerPatient();
void addVisit();
void searchPatient();
void occupancyReport();
void displayMenu();

int main() {
    int choice;

    while (1) {
        displayMenu();
        printf("Choose Option: ");
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input. Please enter a number.\n");
            while (getchar() != '\n'); 
            continue;
        }

        switch (choice) {
            case 1: registerPatient(); break;
            case 2: addVisit(); break;
            case 3: searchPatient(); break;
            case 4: occupancyReport(); break;
            case 5: printf("Exiting system. Goodbye!\n"); return 0;
            default: printf("Invalid choice. Try again.\n");
        }
    }

    return 0;
}

void displayMenu() {
    printf("\n=== CLINIX: PATIENT RECORD SYSTEM ===\n");
    printf("1. Register Patient\n");
    printf("2. Add Visit Record\n");
    printf("3. Search Patient History\n");
    printf("4. Frequent Visitors Report\n");
    printf("5. Exit\n");
    printf("=====================================\n");
}

void registerPatient() {
    FILE *fp = fopen(PATIENT_FILE, "ab+");
    if (fp == NULL) {
        printf("Error opening file!\n");
        return;
    }

    Patient p;
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    sprintf(p.id, "P%ld", (size / sizeof(Patient)) + 101);

    printf("Registering Patient (ID: %s)\n", p.id);
    printf("Enter Name: ");
    scanf(" %[^\n]s", p.name);
    printf("Enter Age: ");
    scanf("%d", &p.age);
    printf("Enter Phone: ");
    scanf("%s", p.phone);

    fwrite(&p, sizeof(Patient), 1, fp);
    fclose(fp);
    printf("SUCCESS: Registered Patient %s with ID: %s\n", p.name, p.id);
}

void addVisit() {
    char id[10];
    printf("Enter Patient ID: ");
    scanf("%s", id);

    FILE *fp = fopen(PATIENT_FILE, "rb");
    Patient p;
    int found = 0;
    while (fread(&p, sizeof(Patient), 1, fp)) {
        if (strcmp(p.id, id) == 0) {
            found = 1;
            break;
        }
    }
    fclose(fp);

    if (!found) {
        printf("ERROR: Patient ID %s not found!\n", id);
        return;
    }

    FILE *vf = fopen(VISIT_FILE, "ab");
    Visit v;
    strcpy(v.patientId, id);
    printf("Enter Date (YYYY-MM-DD): ");
    scanf("%s", v.date);
    printf("Enter Diagnosis: ");
    scanf(" %[^\n]s", v.diagnosis);
    printf("Enter Prescription: ");
    scanf(" %[^\n]s", v.prescription);

    fwrite(&v, sizeof(Visit), 1, vf);
    fclose(vf);
    printf("SUCCESS: Visit recorded for %s\n", id);
}

void searchPatient() {
    char id[10];
    printf("Enter Patient ID: ");
    scanf("%s", id);

    FILE *fp = fopen(PATIENT_FILE, "rb");
    Patient p;
    int found = 0;
    while (fread(&p, sizeof(Patient), 1, fp)) {
        if (strcmp(p.id, id) == 0) {
            printf("\n--- Patient Details ---\n");
            printf("ID: %s | Name: %s | Age: %d | Phone: %s\n", p.id, p.name, p.age, p.phone);
            found = 1;
            break;
        }
    }
    fclose(fp);

    if (!found) {
        printf("ERROR: Patient ID %s not found.\n", id);
        return;
    }

    FILE *vf = fopen(VISIT_FILE, "rb");
    Visit v;
    printf("--- Visit History ---\n");
    int visits = 0;
    while (fread(&v, sizeof(Visit), 1, vf)) {
        if (strcmp(v.patientId, id) == 0) {
            printf("- Date: %s | Diagnosis: %s | Rx: %s\n", v.date, v.diagnosis, v.prescription);
            visits++;
        }
    }
    if (visits == 0) printf("No visits found.\n");
    fclose(vf);
}

void occupancyReport() {
    FILE *fp = fopen(PATIENT_FILE, "rb");
    if (!fp) {
        printf("No records found.\n");
        return;
    }

    printf("\n--- Frequent Visitors Report ---\n");
    Patient p;
    while (fread(&p, sizeof(Patient), 1, fp)) {
        FILE *vf = fopen(VISIT_FILE, "rb");
        Visit v;
        int count = 0;
        while (fread(&v, sizeof(Visit), 1, vf)) {
            if (strcmp(v.patientId, p.id) == 0) count++;
        }
        fclose(vf);
        if (count > 0) {
            printf("%s (ID: %s) - Total Visits: %d\n", p.name, p.id, count);
        }
    }
    fclose(fp);
}
