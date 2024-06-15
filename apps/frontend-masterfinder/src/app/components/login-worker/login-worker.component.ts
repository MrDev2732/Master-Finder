import { Component, ElementRef, ViewChild } from '@angular/core';
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
  styleUrls: ['./login-worker.component.scss'],
  providers: [LoginService]
})

export class LoginWorkerComponent {
  email: string = '';
  password: string = '';
  @ViewChild('container', { static: false }) container!: ElementRef;

  constructor(private loginService: LoginService, private router: Router) {}

  login() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Redirige al dashboard después del login
        this.router.navigate(['/perfil-worker']);
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

  onRegister() {
    this.container.nativeElement.classList.add("active");
  }

  onLogin() {
    this.container.nativeElement.classList.remove("active");
  }
}
