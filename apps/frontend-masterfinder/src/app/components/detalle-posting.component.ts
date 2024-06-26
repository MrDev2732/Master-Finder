import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
    private postingService: FiltrosService,
    private router: Router
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
        this.posting = data;
      },
      error: (error) => {
        console.error('Error fetching posting details:', error);
      }
    });
  }

  goToProfile(): void {
    if (this.posting && this.posting.worker && this.posting.worker.id) {
      this.router.navigate(['/profile', this.posting.worker.id]); // Asegúrate de que la ruta sea '/profile'
    } else {
      console.error('Posting or worker is undefined');
    }
  }


}

