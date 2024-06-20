import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosService } from '../../../services/filtros.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './filtros.component.html',
  styleUrl: './filtros.component.scss',
})
export class FiltrosComponent {

  public postings: any[] = [];

  constructor(private postingService: FiltrosService) { }

  ngOnInit(): void {
    this.loadPostings();
  }

  // loadPostings(): void {
  //   this.postingService.getAllPostings().subscribe({
  //     next: (data) => {
  //       this.postings = data;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching postings:', error);
  //     }
  //   });
  // }

  // onFilterSubmit(): void {
  //   // Aquí puedes agregar lógica para enviar filtros específicos al backend
  //   this.loadPostings();
  // }

  public selectedJobType: string = '';

  public jobTypes: string[] = ['Carpintería', 'Electricidad', 'Gasfitería'];

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

}
