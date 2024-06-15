import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Worker } from '../app/interfaces/worker';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:8000/api/workers/worker'; // Ajusta según sea necesario

  constructor(private http: HttpClient) {}

  registerWorker(worker: Worker): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}?first_name=${worker.first_name}&last_name=${worker.last_name}&rut=${worker.rut}&contact_number=${worker.contact_number}&email=${worker.email}&password=${worker.password}&location=${worker.location}&specialty=${worker.specialty}`, {});
  }
}
