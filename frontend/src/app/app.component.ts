import { Component } from '@angular/core';
import { StudentFormComponent } from './components/student-form/student-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StudentFormComponent], // Remove HttpClientModule from here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'student-management';
}