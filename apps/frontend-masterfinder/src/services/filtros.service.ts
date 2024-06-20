import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltrosService {

  private apiUrl = 'http://localhost:8000/api/postings/all-postings';

  constructor(private http: HttpClient) { }

  // getAllPostings(): Observable<any> {
  //   return this.http.get(this.apiUrl);
  // }

  getAllPostings(job_type?: string) {
    let params = new HttpParams();
    if (job_type) {
      params = params.append('job_type', job_type);
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }


}
