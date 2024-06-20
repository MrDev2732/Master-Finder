import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStatus = new BehaviorSubject<boolean>(false);
  private authChecked = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkTokenExists();  // Verificar el token al iniciar el servicio
  }

  private hasToken(): boolean {
    return !!sessionStorage.getItem('access_token');
  }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }

  getAuthChecked() {
    return this.authChecked.asObservable();
  }

  checkTokenExists(): void {
    const tokenExists = this.hasToken();
    this.authStatus.next(tokenExists);
    this.authChecked.next(true);  // Indica que la verificación inicial ha sido completada
  }

  setAuthStatus(status: boolean) {
    this.authStatus.next(status);
  }

  login(token: string) {
    sessionStorage.setItem('access_token', token);
    this.setAuthStatus(true); // Asegúrate de que esto se llama correctamente
  }

  logout() {
    sessionStorage.removeItem('access_token');
    this.setAuthStatus(false); // Asegúrate de que esto se llama correctamente
  }

  // Métodos para actualizar los BehaviorSubjects
  authenticateUser() {
    // Simula la autenticación
    this.authStatus.next(true);
    this.authChecked.next(true);
  }

  logoutUser() {
    this.authStatus.next(false);
    this.authChecked.next(false);
  }
}
