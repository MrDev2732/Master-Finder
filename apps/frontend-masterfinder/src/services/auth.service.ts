import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStatus = new BehaviorSubject<boolean>(false);
  private authChecked = new BehaviorSubject<boolean>(false);
  private isClient = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkTokenExists();  // Verificar el token al iniciar el servicio
  }

  private hasToken(): boolean {
    return !!sessionStorage.getItem('access_token');
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  getAuthChecked(): Observable<boolean> {
    return this.authChecked.asObservable();
  }

  getIsClient(): Observable<boolean> {
    return this.isClient.asObservable();
  }

  checkTokenExists(): void {
    const tokenExists = this.hasToken();
    this.authStatus.next(tokenExists);
    if (tokenExists) {
      this.verifyUserType();
    } else {
      this.authChecked.next(true);  // Indica que la verificación inicial ha sido completada
    }
  }

  setAuthStatus(status: boolean): void {
    this.authStatus.next(status);
  }

  login(token: string): void {
    sessionStorage.setItem('access_token', token);
    this.setAuthStatus(true); // Asegúrate de que esto se llama correctamente
    this.verifyUserType();
  }

  logout(): void {
    sessionStorage.removeItem('access_token');
    this.setAuthStatus(false); // Asegúrate de que esto se llama correctamente
    this.isClient.next(false);
  }

  verifyUserType(): void {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ isClient: boolean }>('http://localhost:8000/api/clients/check-user-type', { headers })
      .pipe(
        map(response => response.isClient)
      )
      .subscribe(isClient => {
        this.isClient.next(isClient);
        this.authChecked.next(true);
      }, error => {
        console.error('Error checking user type', error);
        this.authChecked.next(true);
      });
  }

  getToken(): string {
    const token = sessionStorage.getItem('access_token');
    return token ? token : '';
  }
}
