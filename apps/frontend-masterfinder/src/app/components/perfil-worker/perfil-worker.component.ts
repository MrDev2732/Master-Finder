import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PublicacionService } from '../../../services/publicacion.service';
import { PerfilService } from '../../../services/perfil.service';
import { AuthService } from '../../../services/auth.service';
import { FiltrosService } from '../../../services/filtros.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

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
    private authService: AuthService,  // Inyecta AuthService
    private postingService: FiltrosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.getWorkerData(),
    this.loadPostings();  // Llama a getWorkerData al inicializar el componente
  }

  // Variable para almacenar los datos del worker
  workerData: any;
  showSubscriptionSection = true;
  postingToEdit: any = null;
  selectedFile: File | null = null;
  newImageFile: File | null = null;
  mostrarModalEditar = false;
  publicacionSeleccionada: any = { job_type: '', description: '', image: null };


  
  // Método para obtener los datos del worker y asignarlos a la variable workerData
  getWorkerData() {
    this.perfilService.getWorker().subscribe(
      (data: any) => {
        this.workerData = data; // Asigna los datos del trabajador a workerData
        this.showSubscriptionSection = !this.workerData.subscription; // Oculta la sección si el trabajador tiene suscripción
      },
      (error: any) => {
        console.error('Error al obtener los datos del worker', error);
      }
    );
  }

  editarPublicacion(posting: any) {
    this.postingToEdit = { ...posting };
  }

  cancelarEdicion() {
    this.postingToEdit = null;
    this.newImageFile = null;
  }


  onFileSelectedEditar(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onNewImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(file.type)) {
      this.newImageFile = file;
    } else {
      console.error('Invalid file format or size');
      this.newImageFile = null;
    }
  }


  abrirModalEditar(publicacion: any) {
    this.publicacionSeleccionada = { ...publicacion };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.publicacionSeleccionada = { job_type: '', description: '', image: null };
    this.selectedFile = null;
  }


  actualizarPublicacion() {
    if (!this.publicacionSeleccionada.job_type || !this.publicacionSeleccionada.description) {
      console.error('Todos los campos son obligatorios');
      return;
    }

    const formData = new FormData();
    formData.append('posting_id', this.publicacionSeleccionada.id);
    formData.append('job_type', this.publicacionSeleccionada.job_type);
    formData.append('description', this.publicacionSeleccionada.description);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postingService.updatePosting(formData).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'Publicación actualizada',
          text: 'La publicación ha sido actualizada exitosamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.cerrarModalEditar();
          this.loadPostings();
        });
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'No se pudo actualizar la publicación. Por favor, inténtelo nuevamente.',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al actualizar la publicación', error);
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
  showPublications = false;

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


    // Método para validar la descripción

  validarDescripcion(description: string): boolean {

    const regex = /\S{18,}/; // Expresión regular para encontrar palabras de 18 caracteres o más sin espacios

    return !regex.test(description);

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

    if (!this.validarDescripcion(description)) {

      Swal.fire({
        icon: 'error',
        title: 'Descripción inválida',
        text: 'La descripción no puede contener palabras de más de 18 caracteres o letras consecutivas',
        confirmButtonText: 'Aceptar'

      });

      return;

    }

    console.log('Datos a enviar:', {
      jobType,
      description,
      image
    });

    this.publicacionService.createPosting(accessToken, jobType, description, image).subscribe(
      (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Publicación creada exitosamente',
          text: 'La publicación ha sido creada exitosamente.',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.cerrarModalPublicacion(); // Cierra el modal después de crear la publicación
            this.loadPostings(); // Recarga la página después de que el usuario haga clic en "Aceptar"
            this.resetForm(); // Limpia todos los campos del formulario
          }
        });
      },
      (error: any) => {
        console.error('Error al crear la publicación', error);
        alert(error); // Muestra el error en una alerta
      }
    );
  }

  // Método para limpiar todos los campos del formulario
  resetForm() {
    this.nuevaPublicacion = { files: [], job_types: '', description: '' };
    this.files = [];
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /* Ver sus publicaciones */
  public postings: any[] = [];

  loadPostings(): void {
    this.postingService.getAllPostings().subscribe({
      next: (data) => {
        this.postings = data.filter(posting => posting.worker_id === this.workerData.id).reverse();
      },
      error: (error) => {
        console.error('Error fetching postings:', error);
      }
    });
}

/* Eliminar y Actualizar publicaciones */
eliminarPublicacion(postingId: string): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Deseas eliminar esta publicación?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.publicacionService.deletePosting(postingId).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Publicación eliminada',
            text: 'La publicación ha sido eliminada exitosamente.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.loadPostings(); // Recargar la lista de publicaciones
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: 'No se pudo eliminar la publicación. Por favor, inténtelo nuevamente.',
            confirmButtonText: 'Aceptar'
          });
          console.error("Error al eliminar la publicación", error);
        }
      );
    }
  });
}

togglePublications() {
  this.showPublications = !this.showPublications;
}

// Variables para la edición del perfil
editProfileData = {
  contact_number: '',
  email: '',
  specialty: '',
  location: '',
  profile_description: ''
};
mostrarModalEditarPerfil = false;
selectedProfileImage: File | null = null; // Nueva variable para la imagen de perfil

// Método para abrir el modal de edición del perfil
abrirModalEditarPerfil() {
  this.editProfileData = { ...this.workerData };
  this.mostrarModalEditarPerfil = true;
}

// Método para cerrar el modal de edición del perfil
cerrarModalEditarPerfil() {
  this.mostrarModalEditarPerfil = false;
}

// Método para manejar la selección de la imagen de perfil
onProfileImageSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedProfileImage = file;
  }
}

// Método para actualizar los datos del perfil
actualizarPerfil() {
  const formData = new FormData();
  formData.append('contact_number', this.editProfileData.contact_number);
  formData.append('email', this.editProfileData.email);
  formData.append('specialty', this.editProfileData.specialty);
  formData.append('location', this.editProfileData.location);
  formData.append('profile_description', this.editProfileData.profile_description);
  if (this.selectedProfileImage) {
    formData.append('image', this.selectedProfileImage);
  }

  this.perfilService.updateWorker(formData).subscribe(
    response => {
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'El perfil ha sido actualizado exitosamente.',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.cerrarModalEditarPerfil();
        this.getWorkerData(); // Recargar los datos del trabajador
      });
    },
    error => {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: 'No se pudo actualizar el perfil. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar'
      });
      console.error('Error al actualizar el perfil', error);
    }
  );
}
}
