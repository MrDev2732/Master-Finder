import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute } from '@angular/router';
import { PerfilService } from '../../../services/perfil.service';
import { PublicacionService } from '../../../services/publicacion.service';
import { RatingService } from '../../../services/rating.service';
import Swal from 'sweetalert2'; 
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-posting',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './profile-posting.component.html',
  styleUrls: ['./profile-posting.component.scss'],
})
export class ProfilePostingComponent implements OnInit {

  rating = 0;  // Calificación promedio inicial
  stars = [1, 2, 3, 4, 5];  // Representa cada estrella
  comment = '';  // Comentario del usuario
  showSubscriptionSection = true;
  isAuthenticated = false; 
  isClient = false; 
  showThankYouMessage = false; 
  fadeOut = false;

  public worker: any;
  ratings: any[] = []; // Array para almacenar las calificaciones
  calificacionpromedio: number = 0;

  constructor(
    private route: ActivatedRoute,
    private perfilService: PerfilService,
    private publicacionService: PublicacionService, // Inyecta el servicio,
    private ratingService: RatingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkerProfile(id);
      this.loadWorkerRatings(id); // Llama a la función para cargar las calificaciones
      this.authService.getIsClient().subscribe(isClient => {
        this.isClient = isClient;
      });
    }
  }

  rate(newRating: number) {
    this.rating = newRating; 
  }

  obtenerCalificaciones() {
    if (this.worker && this.worker.id) {
      this.ratingService.getRatingsByWorkerId(this.worker.id).subscribe(ratings => {
        this.ratings = ratings;
        this.calificacionpromedio = this.calcularPromedio(ratings);
      });
    }
  }

  calcularPromedio(ratings: any[]): number {
    if (ratings.length === 0) return 0;
    const suma = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return suma / ratings.length;
  }

  validarComentario(comentario: string): boolean {
    const regex = /\S{28,}/; // Expresión regular para encontrar palabras de 18 caracteres o más sin espacios
    return !regex.test(comentario);
  }


  handleRating(): void { 
    if (!this.validarComentario(this.comment)) {
      Swal.fire({
        icon: 'error',
        title: 'Descripción inválida',
        text: 'El comentario no puede contener palabras de más de 28 caracteres o letras consecutivas',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (this.worker && this.worker.id) {
      this.ratingService.createRating(this.worker.id, this.rating, this.comment).subscribe({
        next: (response) => {
          Swal.fire({ // Alerta de éxito
            icon: 'success',
            title: '¡Éxito!',
            text: 'Calificación enviada con éxito.',
          });
          this.ratings.push(response); // Añade la nueva calificación al array de calificaciones
          this.calificacionpromedio = this.calcularPromedio(this.ratings); // Actualiza el promedio
          this.rating = 0; // Resetea la calificación a 0
          this.comment = ''; // Limpia el área de texto del comentario
          this.loadWorkerRatings(this.worker.id); // Recarga las calificaciones
          this.showThankYouMessage = true; // Mostrar el mensaje de agradecimiento
          
          setTimeout(() => {
            this.fadeOut = true; // Aplicar la clase fade-out
          }, 0); // Aplicar inmediatamente la clase fade-out

          setTimeout(() => {
            this.fadeOut = false; // Aplicar la clase fade-out-active después de 5 segundos
            this.showThankYouMessage = false; // Ocultar el mensaje de agradecimiento después del desvanecimiento
          }, 50000);
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
        this.ratings = data.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        this.calificacionpromedio = this.calcularPromedio(this.ratings);
      },
      error: (error) => {
        console.error('Error fetching worker ratings:', error);
      }
    });
  }


}