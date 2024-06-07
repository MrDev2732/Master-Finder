import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], // Asegúrate de importar FormsModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/login-worker']);
  }
}
