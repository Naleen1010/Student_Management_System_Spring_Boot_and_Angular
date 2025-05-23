import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/api/students';
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.loadStudents();
  }

  getStudents(): Observable<Student[]> {
    return this.studentsSubject.asObservable();
  }

  loadStudents(): void {
    this.http.get<Student[]>(this.baseUrl)
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (students) => {
          console.log('Loaded students:', students);
          this.studentsSubject.next(students);
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.studentsSubject.next([]);
        }
      });
  }

  addStudent(student: Student): Observable<Student> {
    // Remove id field for creation, let backend assign it
    const studentData = {
      firstName: student.firstName,
      lastName: student.lastName,
      address: student.address,
      grade: student.grade,
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth
    };
    
    console.log('Sending student data:', studentData);
    
    return this.http.post<Student>(this.baseUrl, studentData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateStudent(student: Student): Observable<Student> {
    const url = `${this.baseUrl}/${student.id}`;
    const studentData = {
      firstName: student.firstName,
      lastName: student.lastName,
      address: student.address,
      grade: student.grade,
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth
    };
    
    console.log('Updating student data:', studentData);
    
    return this.http.put<Student>(url, studentData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteStudent(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error) {
        errorMessage += `\nDetails: ${JSON.stringify(error.error)}`;
      }
    }
    
    console.error('HTTP Error:', errorMessage);
    console.error('Full error object:', error);
    return throwError(() => errorMessage);
  }
}