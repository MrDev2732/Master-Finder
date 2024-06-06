import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Worker } from '../../interfaces/worker';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { error } from 'console';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor( private loginService: LoginService, private router: Router ){}



  loginUser(username: string, password: string):void{
    this.loginService.getUser(username, password).subscribe(
      (response: any) => {
        const user = response.first_name
        const password = response.password
      },
      (error : any) => {
        console.error('Error en el login del usuario', error);
      }
    )
  }
}
