import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltrosService {

  private apiUrl = 'http://localhost:8000/api/postings/all-postings';

  constructor(private http: HttpClient) { }

  getAllPostings(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
