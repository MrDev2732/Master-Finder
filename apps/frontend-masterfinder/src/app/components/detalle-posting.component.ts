import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FiltrosService } from '../../services/filtros.service'; 

@Component({
  selector: 'app-detalle-posting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-posting.component.html',
  styleUrl: './detalle-posting.component.scss',
})
export class DetallePostingComponent implements OnInit {

  public posting: any;

  constructor(
    private route: ActivatedRoute,
    private postingService: FiltrosService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPostingDetails(id);
    }
  }

  loadPostingDetails(id: string): void {
    this.postingService.getPostingById(id).subscribe({
      next: (data) => {
        console.log(data); // Esto imprimirá los datos recibidos
        this.posting = data;
      },
      error: (error) => {
        console.error('Error fetching posting details:', error);
      }
    });
  }

  
}

