import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-profile-posting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-posting.component.html',
  styleUrl: './profile-posting.component.scss',
})
export class ProfilePostingComponent implements OnInit {

  rating = 0;  // Calificación promedio inicial
  stars = [1, 2, 3, 4, 5];  // Representa cada estrella
  
  public worker: any;

  rate(newRating: number) {
    // Aquí deberías implementar la lógica para actualizar la calificación en el backend
    console.log(`Nueva calificación: ${newRating}`);
    // Supongamos que actualizas la calificación promedio después de recibir una nueva
    this.rating = newRating; // Esto es solo un ejemplo, deberas calcular el promedio
  }


  constructor(
    private route: ActivatedRoute,
    private perfilService: PerfilService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkerProfile(id);
    }
  }

  loadWorkerProfile(id: string): void {
    this.perfilService.getWorkerById(id).subscribe({
      next: (data) => {
        this.worker = data;
      },
      error: (error) => {
        console.error('Error fetching worker profile:', error);
      }
    });
  }

}