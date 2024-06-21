import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {
  private apiUrl = 'http://localhost:8000/api/postings'; // URL base de tu API FastAPI

  constructor(private http: HttpClient) { }

  
  getAllPostings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-postings`);
  }


  createPosting(accessToken: string, jobType: string, description: string, image: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('job_type', jobType);
    formData.append('description', description);
    formData.append('image', image);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.post(`${this.apiUrl}/posting`, formData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('An error occurred:', error.error.message);
    } else {
      // Error del lado del servidor
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`); // Mejorar la salida del cuerpo del error
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  

  
}
