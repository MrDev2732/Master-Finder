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

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('email', email);
    body.set('password', password);

    return this.http.post(`${this.apiUrl}/login`, body.toString(), { headers, withCredentials: true, responseType: 'text' })
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
}
