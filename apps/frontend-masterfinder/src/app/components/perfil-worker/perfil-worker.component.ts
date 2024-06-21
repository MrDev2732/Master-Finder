import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule
import { HttpClient } from '@angular/common/http';
import { PublicacionService } from '../../../services/publicacion.service';
import { PerfilService } from '../../../services/perfil.service';
import { AuthService } from '../../../services/auth.service';  // Importa AuthService

@Component({
  selector: 'app-perfil-worker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-worker.component.html',
  styleUrls: ['./perfil-worker.component.scss'],
})
export class PerfilWorkerComponent implements OnInit {  // Implementa OnInit
  rating = 0;  // Calificación promedio inicial
  stars = [1, 2, 3, 4, 5];  // Representa cada estrella

  rate(newRating: number) {
    // Aquí deberías implementar la lógica para actualizar la calificación en el backend
    console.log(`Nueva calificación: ${newRating}`);
    // Supongamos que actualizas la calificación promedio después de recibir una nueva
    this.rating = newRating; // Esto es solo un ejemplo, deberías calcular el promedio
  }

  constructor(
    private http: HttpClient, 
    private publicacionService: PublicacionService, 
    private perfilService: PerfilService,
    private authService: AuthService  // Inyecta AuthService
  ) {}

  
  ngOnInit() {
    this.getWorkerData();  // Llama a getWorkerData al inicializar el componente
  }

  
  // Variable para almacenar los datos del worker
  workerData: any;

  // Método para obtener los datos del worker y asignarlos a la variable workerData
getWorkerData() {
  this.perfilService.getWorker().subscribe(
    (data: any) => {
      this.workerData = data; // Asigna los datos del trabajador a workerData
      
      console.log('Datos del worker:', this.workerData);
    },
    (error: any) => {
      console.error('Error al obtener los datos del worker', error);
    }
  );
}


  getStarWidth(index: number): number {
    const starNumber = index + 1;
    if (this.rating >= starNumber) {
      return 100;  // 100% lleno si la calificación es mayor o igual al número de la estrella
    } else if (this.rating > index && this.rating < starNumber) {
      const decimalPart = this.rating - index;
      if (decimalPart >= 0.7) {
        return 100;  // Redondea hacia arriba si el decimal es mayor o igual a 0.7
      } else if (decimalPart >= 0.3) {
        return 50;  // Muestra media estrella si el decimal es mayor o igual a 0.3
      } else {
        return 0;  // No muestra nada si el decimal es menor a 0.3
      }
    } else {
      return 0;  // 0% lleno si la calificación es menor al número de la estrella
    }
  }

  /* Crear publicaciones */
  mostrarModal = false;
  nuevaPublicacion = { texto: '', files: [], job_types: '', description: '' };
  files: any[] = [];
  publicaciones: any[] = [];

  abrirModalPublicacion() {
    this.mostrarModal = true;
  }

  cerrarModalPublicacion() {
    this.mostrarModal = false;
    this.nuevaPublicacion = { texto: '', files: [], job_types: '', description: ''  };
    this.files = [];
  }

  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    for (let file of selectedFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.files.push({ url: e.target.result, name: file.name, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarArchivo(index: number) {
    this.files.splice(index, 1);
  }

  publicar() {
    const token = this.authService.getToken();  // Usa authService para obtener el token
    if (!token) {
      alert('No estás autenticado.');
      return;
    }

    const formData = new FormData();
    formData.append('job_type', this.nuevaPublicacion.job_types);
    formData.append('description', this.nuevaPublicacion.description);
    this.files.forEach(file => {
      formData.append('image', file);
    });

    this.publicacionService.createPosting(token, this.nuevaPublicacion.job_types, this.nuevaPublicacion.description, this.files[0])
      .subscribe({
        next: (response) => {
          console.log('Publicación creada', response);
          this.cerrarModalPublicacion();
        },
        error: (error) => {
          console.error('Error al publicar', error);
        }
      });
  }
}
