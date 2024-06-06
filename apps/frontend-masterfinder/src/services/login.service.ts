import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8000/workers/login'

  constructor( private http : HttpClient,
               private router : Router
  ) { }

  getUser(username: string, password: string){
    return this.http.get(`${this.apiUrl}?username=${username}&password=${password}`);
  }




}
