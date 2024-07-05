import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private baseUrl = 'http://localhost:8000/api/clients/create-rating'; // URL ajustada
  private getRatingsUrl = 'http://localhost:8000/api/clients/get-ratings'; 
  private getWorkerRatingsUrl = 'http://localhost:8000/api/workers/worker';

  constructor(private http: HttpClient, private authService: AuthService) { }

  createRating(workerId: string, rating: number, content: string): Observable<any> {
    const token = this.authService.getToken(); // Obtener el token de autenticación
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
        .set('worker_id', workerId)
        .set('rating', rating.toString())
        .set('content', content);

    return this.http.post(`${this.baseUrl}`, null, { headers, params });
}

  // Nuevo método para obtener ratings por worker_id
  getRatingsByWorkerId(workerId: string): Observable<any> {
    const token = this.authService.getToken(); // Obtener el token de autenticación
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('worker_id', workerId);

    return this.http.get(`${this.getRatingsUrl}/${workerId}`, { headers, params });
  }

  getWorkerRatings(workerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.getWorkerRatingsUrl}/${workerId}/ratings`);
  }

}
