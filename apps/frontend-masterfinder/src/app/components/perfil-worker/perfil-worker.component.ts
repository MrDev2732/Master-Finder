import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule

@Component({
  selector: 'app-perfil-worker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-worker.component.html',
  styleUrl: './perfil-worker.component.scss',
})
export class PerfilWorkerComponent {
  rating = 0;  // Calificación promedio inicial
  stars = [1, 2, 3, 4, 5];  // Representa cada estrella

  rate(newRating: number) {
    // Aquí deberías implementar la lógica para actualizar la calificación en el backend
    console.log(`Nueva calificación: ${newRating}`);
    // Supongamos que actualizas la calificación promedio después de recibir una nueva
    this.rating = newRating; // Esto es solo un ejemplo, deberías calcular el promedio
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
  nuevaPublicacion = { texto: '', files: [] };
  files: any[] = [];
  publicaciones: any[] = [];

  abrirModalPublicacion() {
    this.mostrarModal = true;
  }

  cerrarModalPublicacion() {
    this.mostrarModal = false;
    this.nuevaPublicacion = { texto: '', files: [] };
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
    if (this.nuevaPublicacion.texto && this.files.length > 0) {
      this.publicaciones.push({ texto: this.nuevaPublicacion.texto, files: [...this.files] });
      this.cerrarModalPublicacion();
    } else {
      alert('Debe agregar una descripción y al menos una imagen o video.');
    }
  }

  
}
