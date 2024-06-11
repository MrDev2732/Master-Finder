import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PublicacionService {
  private apiUrl = 'http://localhost:8000/api/workers'; // URL base de tu API FastAPI

  constructor(private http: HttpClient) { }

  
}
