import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  students: Student[] = [];
  isEditMode = false;
  editingStudentId: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required]],
      grade: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      dateOfBirth: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (students) => {
        this.students = students;
        console.log('Students loaded in component:', students);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load students';
        console.error('Error loading students:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.studentForm.disable();
      
      const formValue = this.studentForm.value;
      console.log('Form value:', formValue);
      
      // Clean the form data - ensure all fields are strings and not null/undefined
      const cleanedData = {
        firstName: (formValue.firstName || '').trim(),
        lastName: (formValue.lastName || '').trim(),
        address: (formValue.address || '').trim(),
        grade: (formValue.grade || '').trim(),
        phoneNumber: (formValue.phoneNumber || '').trim(),
        dateOfBirth: (formValue.dateOfBirth || '').trim()
      };
      
      console.log('Cleaned form data:', cleanedData);
      
      if (this.isEditMode && this.editingStudentId) {
        // Update existing student
        const updatedStudent: Student = {
          id: this.editingStudentId,
          ...cleanedData
        };
        
        this.studentService.updateStudent(updatedStudent).subscribe({
          next: (student) => {
            console.log('Student updated successfully:', student);
            this.studentService.loadStudents();
            this.resetForm();
          },
          error: (error) => {
            this.errorMessage = 'Failed to update student: ' + error;
            this.isLoading = false;
            this.studentForm.enable();
            console.error('Error updating student:', error);
          }
        });
      } else {
        // Create new student
        const newStudent: Student = {
          id: 0, // Backend will assign ID
          ...cleanedData
        };
        
        console.log('Creating new student:', newStudent);
        
        this.studentService.addStudent(newStudent).subscribe({
          next: (student) => {
            console.log('Student created successfully:', student);
            this.studentService.loadStudents();
            this.resetForm();
          },
          error: (error) => {
            this.errorMessage = 'Failed to create student: ' + error;
            this.isLoading = false;
            this.studentForm.enable();
            console.error('Error creating student:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      console.log('Form is invalid:', this.studentForm.errors);
    }
  }

  onEdit(student: Student): void {
    this.isEditMode = true;
    this.editingStudentId = student.id;
    this.errorMessage = '';
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      address: student.address,
      grade: student.grade,
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth
    });
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          console.log('Student deleted successfully');
          this.studentService.loadStudents();
          this.isLoading = false;
          if (this.isEditMode && this.editingStudentId === id) {
            this.cancelEdit();
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete student: ' + error;
          this.isLoading = false;
          console.error('Error deleting student:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingStudentId = null;
    this.errorMessage = '';
    this.resetForm();
  }

  resetForm(): void {
    this.studentForm.reset();
    this.studentForm.enable();
    this.isEditMode = false;
    this.editingStudentId = null;
    this.errorMessage = '';
    this.isLoading = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.studentForm.controls).forEach(key => {
      this.studentForm.get(key)?.markAsTouched();
    });
  }

  // Getter methods for easy access to form controls
  get firstName() { return this.studentForm.get('firstName'); }
  get lastName() { return this.studentForm.get('lastName'); }
  get address() { return this.studentForm.get('address'); }
  get grade() { return this.studentForm.get('grade'); }
  get phoneNumber() { return this.studentForm.get('phoneNumber'); }
  get dateOfBirth() { return this.studentForm.get('dateOfBirth'); }
}