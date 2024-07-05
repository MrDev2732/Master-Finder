import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8000/api/login';
  private logOut = 'http://localhost:8000/api/login/logout';
  private resetPassword = 'http://localhost:8000/api/workers/password-worker';

  constructor(private http: HttpClient) {}

  loginWorker(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('email', email);
    body.set('password', password);

    return this.http.post(`${this.apiUrl}/login-worker`, body.toString(), { headers, withCredentials: true, responseType: 'json' })
      .pipe(
        map(response => {
          // Procesar la respuesta HTML si es necesario
          console.log(response);
          return response;
        })
      );
  }

  loginClient(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('email', email);
    body.set('password', password);

    return this.http.post(`${this.apiUrl}/login-client`, body.toString(), { headers, withCredentials: true, responseType: 'json' })
      .pipe(
        map(response => {
          // Procesar la respuesta HTML si es necesario
          console.log(response);
          return response;
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(this.logOut, {}, { withCredentials: true, responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('Logout response:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Logout request failed', error);
        return throwError(error);
      })
    );
  }

  sendEmail(email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('email', email);

    return this.http.put(`${this.apiUrl}/password`, body.toString(), { headers, withCredentials: true, responseType: 'text' })
      .pipe(
        map(response => {
          console.log('Password update response:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Password update request failed', error);
          return throwError(error);
        })
      );
  }

  verifyCode(id: string, code: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reset-token`, { params: { id, code } })
      .pipe(
        map(response => {
          console.log('Code verification response:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Code verification request failed', error);
          return throwError(error);
        })
      );
  }

  updateWorkerPassword(id: string, newPassword: string): Observable<any> {
    const url = `${this.resetPassword}?id=${encodeURIComponent(id)}&new_password=${encodeURIComponent(newPassword)}`;
    const headers = new HttpHeaders({ 'accept': 'application/json' });

    return this.http.put(url, {}, { headers, withCredentials: true, responseType: 'json' })
      .pipe(
        map(response => {
          console.log('Password update response:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Password update request failed', error);
          return throwError(error);
        })
      );
  }
}
