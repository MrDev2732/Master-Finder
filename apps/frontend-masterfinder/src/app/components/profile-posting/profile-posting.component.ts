import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { ActivatedRoute } from '@angular/router';
import { PerfilService } from '../../../services/perfil.service';
import { PublicacionService } from '../../../services/publicacion.service'; // Importa el servicio
import { RatingService } from '../../../services/rating.service';
import Swal from 'sweetalert2'; // Asegúrate de que SweetAlert2 está importado

@Component({
  selector: 'app-profile-posting',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añade FormsModule aquí
  templateUrl: './profile-posting.component.html',
  styleUrls: ['./profile-posting.component.scss'],
})
export class ProfilePostingComponent implements OnInit {

  rating = 0;  // Calificación promedio inicial
  stars = [1, 2, 3, 4, 5];  // Representa cada estrella
  comment = '';  // Comentario del usuario
  showSubscriptionSection = true;
  
  public worker: any;
  public ratings: any[] = []; // Array para almacenar las calificaciones

  rate(newRating: number) {
    // Aquí deberías implementar la lógica para actualizar la calificación en el backend
    console.log(`Nueva calificación: ${newRating}`);
    // Supongamos que actualizas la calificación promedio después de recibir una nueva
    this.rating = newRating; // Esto es solo un ejemplo, deberas calcular el promedio
  }




  constructor(
    private route: ActivatedRoute,
    private perfilService: PerfilService,
    private publicacionService: PublicacionService, // Inyecta el servicio,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkerProfile(id);
      this.loadWorkerRatings(id); // Llama a la función para cargar las calificaciones
    }
  }

  handleRating(): void { 
    if (this.worker && this.worker.id) {
      this.ratingService.createRating(this.worker.id, this.rating, this.comment).subscribe({
        next: (response) => {
          console.log('Calificación enviada con éxito:', response);
          Swal.fire({ // Alerta de éxito
            icon: 'success',
            title: '¡Éxito!',
            text: 'Calificación enviada con éxito.',
          });
          this.comment = ''; // Limpia el área de texto del comentario
        },
        error: (error) => {
          console.error('Error al enviar la calificación:', error);
          Swal.fire({ // Alerta de error
            icon: 'error',
            title: 'Error',
            text: 'No se pudo enviar la calificación.',
          });
        }
      });
    } else {
      Swal.fire({ // Alerta si no hay datos del trabajador
        icon: 'info',
        title: 'Información',
        text: 'No se ha seleccionado ningún trabajador.',
      });
    }
  }

  loadWorkerProfile(id: string): void {
    this.perfilService.getWorkerById(id).subscribe({
      next: (data) => {
        this.worker = data;
        this.showSubscriptionSection = !this.worker.subscription;
      },
      error: (error) => {
        console.error('Error fetching worker profile:', error);
      }
    });
  }

  

  loadWorkerRatings(id: string): void {
    this.publicacionService.getWorkerRatings(id).subscribe({
      next: (data) => {
        this.ratings = data;
        console.log('Calificaciones del trabajador:', this.ratings);
      },
      error: (error) => {
        console.error('Error fetching worker ratings:', error);
      }
    });
  }



}