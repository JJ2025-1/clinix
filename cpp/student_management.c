#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DATA_FILE "students.bin"

typedef struct {
    int id;
    char name[50];
    int age;
    char course[50];
    float grade;
} Student;

void addStudent();
void viewStudents();
void searchStudent();
void deleteStudent();
void displayMenu();

int main() {
    int choice;

    while (1) {
        displayMenu();
        printf("Enter your choice: ");
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input. Please enter a number.\n");
            while (getchar() != '\n'); // Clear buffer
            continue;
        }

        switch (choice) {
            case 1: addStudent(); break;
            case 2: viewStudents(); break;
            case 3: searchStudent(); break;
            case 4: deleteStudent(); break;
            case 5: printf("Exiting system. Goodbye!\n"); return 0;
            default: printf("Invalid choice. Try again.\n");
        }
    }

    return 0;
}

void displayMenu() {
    printf("\n=== STUDENT MANAGEMENT SYSTEM (CLINIX) ===\n");
    printf("1. Add Student\n");
    printf("2. View All Students\n");
    printf("3. Search Student by ID\n");
    printf("4. Delete Student by ID\n");
    printf("5. Exit\n");
    printf("==========================================\n");
}

void addStudent() {
    FILE *fp = fopen(DATA_FILE, "ab");
    if (fp == NULL) {
        printf("Error opening file!\n");
        return;
    }

    Student s;
    printf("Enter Student ID: ");
    scanf("%d", &s.id);
    printf("Enter Name: ");
    scanf(" %[^\n]s", s.name);
    printf("Enter Age: ");
    scanf("%d", &s.age);
    printf("Enter Course: ");
    scanf(" %[^\n]s", s.course);
    printf("Enter Grade: ");
    scanf("%f", &s.grade);

    fwrite(&s, sizeof(Student), 1, fp);
    fclose(fp);
    printf("Student added successfully!\n");
}

void viewStudents() {
    FILE *fp = fopen(DATA_FILE, "rb");
    if (fp == NULL) {
        printf("No records found.\n");
        return;
    }

    Student s;
    printf("\n%-5s | %-20s | %-3s | %-15s | %-5s\n", "ID", "Name", "Age", "Course", "Grade");
    printf("-------------------------------------------------------------\n");
    while (fread(&s, sizeof(Student), 1, fp)) {
        printf("%-5d | %-20s | %-3d | %-15s | %-5.2f\n", s.id, s.name, s.age, s.course, s.grade);
    }
    fclose(fp);
}

void searchStudent() {
    FILE *fp = fopen(DATA_FILE, "rb");
    if (fp == NULL) {
        printf("No records found.\n");
        return;
    }

    int id, found = 0;
    Student s;
    printf("Enter Student ID to search: ");
    scanf("%d", &id);

    while (fread(&s, sizeof(Student), 1, fp)) {
        if (s.id == id) {
            printf("\nStudent Found:\n");
            printf("ID: %d\nName: %s\nAge: %d\nCourse: %s\nGrade: %.2f\n", s.id, s.name, s.age, s.course, s.grade);
            found = 1;
            break;
        }
    }

    if (!found) printf("Student with ID %d not found.\n", id);
    fclose(fp);
}

void deleteStudent() {
    FILE *fp = fopen(DATA_FILE, "rb");
    if (fp == NULL) {
        printf("No records found.\n");
        return;
    }

    int id, found = 0;
    Student s;
    printf("Enter Student ID to delete: ");
    scanf("%d", &id);

    FILE *tempFp = fopen("temp.bin", "wb");
    while (fread(&s, sizeof(Student), 1, fp)) {
        if (s.id == id) {
            found = 1;
            continue;
        }
        fwrite(&s, sizeof(Student), 1, tempFp);
    }

    fclose(fp);
    fclose(tempFp);

    remove(DATA_FILE);
    rename("temp.bin", DATA_FILE);

    if (found) printf("Student deleted successfully!\n");
    else printf("Student with ID %d not found.\n", id);
}
