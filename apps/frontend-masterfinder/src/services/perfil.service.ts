import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'http://localhost:8000/api/workers';
  private apiUrlClient = 'http://localhost:8000/api/clients';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getWorker(): Observable<any> {
    const token = this.authService.getToken(); // Asegúrate de que este método exista en AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.apiUrl + '/worker', { headers }); // Asegúrate de que el tipo de retorno sea Observable<any>
  }

  getWorkerById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worker/${id}`);
  }

  getAllworkers(): Observable<any> {
    return this.http.get(this.apiUrl+ '/allworkers');
  }

  getSubscribedWorkers(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/subscribed-workers');
  }

  getClient(): Observable<any> {
    const token = this.authService.getToken(); // Asegúrate de que este método exista en AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.apiUrlClient + '/client', { headers }); // Asegrate de que el tipo de retorno sea Observable<any>
  }

  updateWorker(data: FormData): Observable<any> {
    const token = this.authService.getToken(); // Asegúrate de que este método exista en AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/worker`, data, { headers });
  }
}