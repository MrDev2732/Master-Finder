import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { Worker } from '../../interfaces/worker';
import { RegisterService } from '../../../services/register.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

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
  constructor(private loginService: LoginService, private router: Router, private registerService: RegisterService, private authService: AuthService) {}

  login() {
    this.loginService.loginWorker(this.email, this.password).subscribe({
      next: (response) => {
        if (response.access_token) {
          this.authService.login(response.access_token);
          this.authService.setUserType('worker'); // Guardar el tipo de usuario
          // Mostrar la alerta de bienvenida
          Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            text: 'Has iniciado sesión exitosamente.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            window.location.href = '/perfil-worker'; // Refresca la página completamente
          });
        } else {
          console.error('Unexpected response:', response);
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Usuario o contraseña incorrectos.',
          confirmButtonText: 'Aceptar'
        });
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
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Has registrado exitosamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.resetForm(); // Llamada a la función para limpiar el formulario
        });
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

  resetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
