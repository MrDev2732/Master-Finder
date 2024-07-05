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

}
