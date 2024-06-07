import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule], // Asegúrate de importar FormsModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [LoginService]
})
export class HomeComponent {
  firstName: string = '';
  password: string = '';

  constructor(private router: Router, private loginService: LoginService) {}

  login() {
    this.loginService.login(this.firstName, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/dashboard']); // Redirige al dashboard después del login
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }

  logout() {
    this.loginService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful', response);
        this.router.navigate(['/']); // Redirige a la página de inicio después del logout
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    });
  }
}
