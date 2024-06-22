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
    this.rating = newRating; // Esto es solo un ejemplo, deberas calcular el promedio
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
  nuevaPublicacion = { files: [], job_types: '', description: '' };
  files: any[] = [];
  publicaciones: any[] = [];

  abrirModalPublicacion() {
    this.mostrarModal = true;
  }

  cerrarModalPublicacion() {
    this.mostrarModal = false;
    this.nuevaPublicacion = { files: [], job_types: '', description: ''  };
    this.files = [];
  }

  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    for (let file of selectedFiles) {
      if (file.size > 2 * 1024 * 1024) {
        console.error('El archivo excede el tamaño permitido de 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        console.error('Formato de archivo no permitido');
        return;
      }
      this.files.push({ file, url: URL.createObjectURL(file), name: file.name, type: file.type });
    }
  }

  eliminarArchivo(index: number) {
    this.files.splice(index, 1);
  }

  // Método para crear una nueva publicación
  crearPublicacion() {
    const accessToken = this.authService.getToken(); // Obtén el token de acceso
    const jobType = this.nuevaPublicacion.job_types;
    const description = this.nuevaPublicacion.description;
    const image = this.files[0].file; // Asegúrate de que `image.file` sea un objeto `File`

    if (!jobType || !description || !image) {
      console.error('Todos los campos son obligatorios');
      return;
    }

    console.log('Datos a enviar:', {
      jobType,
      description,
      image
    });

    this.publicacionService.createPosting(accessToken, jobType, description, image).subscribe(
      (response: any) => {
        console.log('Publicación creada exitosamente', response);
        this.cerrarModalPublicacion(); // Cierra el modal después de crear la publicación
      },
      (error: any) => {
        console.error('Error al crear la publicación', error);
        alert(error); // Muestra el error en una alerta
      }
    );
  }
}
