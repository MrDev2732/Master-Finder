import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login-worker',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './login-worker.component.html',
  styleUrl: './login-worker.component.scss',
  providers: [LoginService]
})



export class LoginWorkerComponent {
  firstName: string = '';
  password: string = '';
  constructor(private loginService: LoginService, private router: Router) {}

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
