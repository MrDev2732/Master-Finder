import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Worker } from '../app/interfaces/worker';
import { Client } from '../app/interfaces/client';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:8000/api/workers/worker'; // Ajusta segn sea necesario
  private apiUrlClient = 'http://localhost:8000/api/clients/client'; // Ajusta segn sea necesario

  constructor(private http: HttpClient) {}

  registerWorker(worker: Worker): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}?first_name=${worker.first_name}&last_name=${worker.last_name}&rut=${worker.rut}&contact_number=${worker.contact_number}&email=${worker.email}&password=${worker.password}&location=${worker.location}&specialty=${worker.specialty}`, {});
  }

  registerClient(client: Client): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrlClient}?name=${client.first_name}&email=${client.email}&password=${client.password}`, {});
  }
}
