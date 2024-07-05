import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../../../services/perfil.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-client.component.html',
  styleUrl: './perfil-client.component.scss',
})
export class PerfilClientComponent {

  constructor(
    private perfilService: PerfilService,
    private authService: AuthService,  // Inyecta AuthService
  ) {}

  ngOnInit() {
    this.getClientData()  // Llama a getWorkerData al inicializar el componente
  }

  // Variable para almacenar los datos del worker
  clientData: any;
  selectedFile: File | null = null;
  newImageFile: File | null = null;
  mostrarModalEditar = false;

  // Método para obtener los datos del worker y asignarlos a la variable workerData
  getClientData() {
    this.perfilService.getClient().subscribe(
      (data: any) => {
        this.clientData = data; // Asigna los datos del cliente a clientData
      },
      (error: any) => {
        console.error('Error al obtener los datos del cliente', error);
      }
    );
  }
}
