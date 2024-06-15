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

  loadPostings(): void {
    this.postingService.getAllPostings().subscribe({
      next: (data) => {
        this.postings = data;
      },
      error: (error) => {
        console.error('Error fetching postings:', error);
      }
    });
  }

  onFilterSubmit(): void {
    // Aquí puedes agregar lógica para enviar filtros específicos al backend
    this.loadPostings();
  }
}
