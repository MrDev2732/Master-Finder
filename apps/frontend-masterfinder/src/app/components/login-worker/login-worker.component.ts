import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { Worker } from '../../interfaces/worker';
import { RegisterService } from '../../../services/register.service';

@Component({
  selector: 'app-login-worker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-worker.component.html',
  styleUrls: ['./login-worker.component.scss'],
  providers: [LoginService]
})

export class LoginWorkerComponent {
  email: string = '';
  password: string = '';

  Worker: Worker[] = [];
  newWorker: Worker = {
    first_name: '',
    last_name: '',
    rut: '',
    contact_number: '',
    email: '',
    password: '',
    specialty: '',
    location: '',
  };


  @ViewChild('container', { static: false}) container!: ElementRef;
  constructor(private loginService: LoginService, private router: Router, private registerService: RegisterService) {}

  login() {
    this.loginService.login(this.email, this.password).subscribe({
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

  onRegister() {
    this.container.nativeElement.classList.add("active");
  }

  onLogin() {
    this.container.nativeElement.classList.remove("active");
  }

  register() {
    if (!this.newWorker.first_name || !this.newWorker.last_name || !this.newWorker.rut || !this.newWorker.contact_number || !this.newWorker.email || !this.newWorker.password || !this.newWorker.location || !this.newWorker.specialty) {
      console.error('Faltan campos requeridos');
      return;
    }

    this.registerService.registerWorker(this.newWorker).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        window.alert('Registro exitoso'); // Alerta de registro exitoso
        this.resetForm(); // Llamada a la función para limpiar el formulario
      },
      error: (error) => {
        console.error('Error en el registro', error);
        if (error.status === 422) {
          console.error('Detalles del error:', error.error);
        }
      }
    });
  }

  resetForm() {
    this.newWorker = {
      first_name: '',
      last_name: '',
      rut: '',
      contact_number: '',
      email: '',
      password: '',
      specialty: '',
      location: '',
    };
  }
}
