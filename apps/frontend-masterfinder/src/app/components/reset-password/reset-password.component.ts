import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { LoginService } from '../../../services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añade FormsModule a los imports
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  constructor(private loginService: LoginService) {}
  
  email: string = '';
  code: string[] = ['', '', '', '', '', '']; // Inicializa como un array de cadenas vacías
  newPassword: string = '';
  codeSent: boolean = false;
  codeVerified: boolean = false;

  sendCode() {
    this.loginService.sendEmail(this.email).subscribe(response => {
      const userId = response;
      if (userId) {
        sessionStorage.setItem('userId', userId);
        setTimeout(() => {
          sessionStorage.removeItem('userId');
        }, 5 * 60 * 1000);
      }

      Swal.fire({
        title: 'Correo enviado',
        text: 'Se ha enviado un correo con el código de recuperación',
        icon: 'success'
      });

      this.codeSent = true;
    });
  }

  verifyCode() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      const codeString = this.code.join(''); // Convierte el array en una cadena
      this.loginService.verifyCode(userId, parseInt(codeString)).subscribe(response => {
        console.log(codeString);
        if (response) {
          Swal.fire({
            title: 'Código verificado',
            text: 'El código ha sido verificado correctamente',
            icon: 'success'
          });
          this.codeVerified = true;
        }
      }, error => {
        console.error('Code verification request failed', error);
        Swal.fire({
          title: 'Error',
          text: 'La verificación del código falló. Por favor, inténtalo de nuevo.',
          icon: 'error'
        });
      });
    } else {
      console.error('User ID not found in sessionStorage');
      Swal.fire({
        title: 'Error',
        text: 'No se encontró el ID del usuario. Por favor, inténtalo de nuevo.',
        icon: 'error'
      });
    }
  }

  updatePassword() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      console.log(this.newPassword);
      this.loginService.updateWorkerPassword(userId, this.newPassword).subscribe(response => {
        
        Swal.fire({
          title: 'Contraseña actualizada',
          text: 'La contraseña ha sido actualizada correctamente',
          icon: 'success'
        }).then(() => {
          window.location.href = '/login-worker';
        });
      });
    }
  }
}
