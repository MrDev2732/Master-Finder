import { Component, Output, EventEmitter, ViewChildren, QueryList, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from '../../../../services/login.service';
interface SidenavToggle {
  screemWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements AfterViewInit {
  
  @ViewChildren('sidenavLinkText') sidenavLinkTexts!: QueryList<ElementRef>;
  @Output() onToggleSidenav: EventEmitter<SidenavToggle> = new EventEmitter();
  collapsed = false;
  screemWidth = 0;

  constructor( private router: Router,
                private loginService: LoginService
  ) {
    // Recuperar el estado de 'collapsed' desde localStorage
    const savedState = localStorage.getItem('collapsed');
    this.collapsed = savedState === 'true';
  }

  login() {
    this.router.navigate(['/login-worker']);
  }

  home() {
    this.router.navigate(['/']);
  }

  perfil_worker() {
    this.router.navigate(['/perfil-worker']);
  }

  soporte() {
    this.router.navigate(['/soporte']);
  }

  filtros() {
    this.router.navigate(['/filtros']);
  }

  ngAfterViewInit() {
    // Asegurarse de que el display de los elementos se actualice al iniciar
    this.updateSidenavLinkTextDisplay();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screemWidth: this.screemWidth });
    this.updateSidenavLinkTextDisplay();
    // Guardar el estado en localStorage
    localStorage.setItem('collapsed', this.collapsed.toString());
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screemWidth: this.screemWidth });
    console.log(this.collapsed);
    this.updateSidenavLinkTextDisplay();
    // Guardar el estado en localStorage
    localStorage.setItem('collapsed', this.collapsed.toString());
  }

  private updateSidenavLinkTextDisplay(): void {
    this.sidenavLinkTexts.forEach((linkText: ElementRef) => {
      linkText.nativeElement.style.display = this.collapsed ? 'block' : 'none';
    });
  }

  logout() {
    this.loginService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful', response);
        this.router.navigate(['/login-worker']);  // Redirige al usuario a la página de login o inicio
      },
      error: (error) => {
        console.error('Logout failed', error);
        // Puedes mostrar un mensaje de error al usuario aquí si es necesario
      }
    });
  }
  
}
