import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltrosService {

  private apiUrl = 'http://localhost:8000/api/postings'; // URL base de tu API

  constructor(private http: HttpClient) { }

  getAllPostings(job_type?: string): Observable<any[]> {
    let params = new HttpParams();
    if (job_type) {
      params = params.append('job_type', job_type);
    }
    return this.http.get<any[]>(`${this.apiUrl}/all-postings`, { params });
  }

  getPostingById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posting/${id}`);
  }
}
