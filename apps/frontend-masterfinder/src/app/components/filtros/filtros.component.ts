import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosService } from '../../../services/filtros.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './filtros.component.html',
  styleUrl: './filtros.component.scss',
})
export class FiltrosComponent {

  public postings: any[] = [];

  public selectedJobType: string = '';

  public jobTypes: string[] = ['Carpintería', 'Electricidad', 'Gasfitería'];

  constructor(private postingService: FiltrosService, private router: Router) { }

  ngOnInit(): void {
    this.loadPostings();
  }

  onFilterSubmit(): void {
    this.loadPostings(this.selectedJobType);
  }
  
  loadPostings(jobType?: string): void {
    this.postingService.getAllPostings().subscribe({
      next: (data) => {
        console.log(data);  // Esto te ayudará a confirmar la estructura de los datos
        if (jobType) {
          // Asegúrate de que 'job_type' es el nombre correcto del campo en los datos recibidos
          this.postings = data.filter(posting => posting.job_type === jobType);
        } else {
          this.postings = data;
        }
      },
      error: (error) => {
        console.error('Error fetching postings:', error);
      }
    });
  }

  activeAccordion: string | null = null;

  toggleAccordion(accordionId: string): void {
    if (this.activeAccordion === accordionId) {
      this.activeAccordion = null;
    } else {
      this.activeAccordion = accordionId;
    }
  }

  goToDetail(id: string): void {
    this.router.navigate(['/detalle', id]);
  }

}
