import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { PublicacionService } from 'apps/frontend-masterfinder/src/services/publicacion.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


interface SidenavToggle{
  screemWidth: number;
  collapsed: boolean;
}



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule], // Asegúrate de importar FormsModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  

  postings: any[] = [];
  errorMessage: string = 'errooor!';

  constructor(private router: Router,
              private publicacionService: PublicacionService) {}

  login() {
    this.router.navigate(['/login-worker']);
  }

  ngOnInit(): void {
    this.loadPostings();
  }

  loadPostings(): void {
    this.publicacionService.getAllPostings().subscribe({
      next: (data) => {
        this.postings = this.getRandomPostings(data, 3);
      },
      error: (error) => {
        console.error('Error fetching postings:', error);
      }
    });
  }


    // Función para obtener postings al azar
    getRandomPostings(data: any[], count: number): any[] {
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

  
  isSidenavCollapsed = false;
  screenWidth = 0;
  onToggleSidenav(data: SidenavToggle): void{
    this.screenWidth = data.screemWidth;
    this.isSidenavCollapsed = data.collapsed;
  }

}
