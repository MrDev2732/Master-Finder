import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../layout/navbar/navbar.component';


interface SidenavToggle{
  screemWidth: number;
  collapsed: boolean;
}



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent], // Asegúrate de importar FormsModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/login-worker']);
  }
  
  isSidenavCollapsed = false;
  screenWidth = 0;
  onToggleSidenav(data: SidenavToggle): void{
    this.screenWidth = data.screemWidth;
    this.isSidenavCollapsed = data.collapsed;
  }

}
