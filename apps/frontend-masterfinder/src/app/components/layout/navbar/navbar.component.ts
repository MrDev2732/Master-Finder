import { Component, Output, EventEmitter, ViewChildren, QueryList, AfterViewInit, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from '../../../../services/login.service';
import { AuthService } from '../../../../services/auth.service';

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
export class NavbarComponent implements AfterViewInit, OnInit {
  
  @ViewChildren('sidenavLinkText') sidenavLinkTexts!: QueryList<ElementRef>;
  @Output() onToggleSidenav: EventEmitter<SidenavToggle> = new EventEmitter();
  collapsed = false;
  screemWidth = 0;
  isAuthenticated: boolean = false;
  authChecked: boolean = false;

  constructor( private router: Router,
                private loginService: LoginService,
                private authService: AuthService,
                private changeDetectorRef: ChangeDetectorRef
  ) {
    // Recuperar el estado de 'collapsed' desde localStorage
    const savedState = localStorage.getItem('collapsed');
    this.collapsed = savedState === 'true';
  }
  ngOnInit() {
    this.authService.getAuthStatus().subscribe(status => {
      this.isAuthenticated = status;
      this.updateSidenavLinkTextDisplay();
    });
    this.authService.getAuthChecked().subscribe(checked => {
      this.authChecked = checked;
      this.updateSidenavLinkTextDisplay();
    });
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
    if (this.sidenavLinkTexts) {
      this.sidenavLinkTexts.forEach((linkText: ElementRef) => {
        const id = linkText.nativeElement.id;
        switch (id) {
          case 'logoutLink':
            // El enlace de logout solo es visible si el usuario está autenticado y la verificación está completa
            linkText.nativeElement.style.display = (this.isAuthenticated && this.authChecked) ? 'block' : 'none';
            break;
          case 'perfil-workerLink':
            // El enlace de perfil de trabajador solo es visible si existe un token de acceso
            const tokenExists = sessionStorage.getItem('access_token') !== null;
            linkText.nativeElement.style.display = tokenExists ? 'block' : 'none';
            break;
          case 'loginOrRegisterLink':
            // El enlace de inicio de sesión o registro solo es visible si el usuario no está autenticado o no ha verificado la autenticación, y si la barra lateral no está colapsada
            linkText.nativeElement.style.display = (!this.isAuthenticated || !this.authChecked) && !this.collapsed ? 'block' : 'none';
            break;
          default:
            // Para otros enlaces, manejar la visibilidad basada en si la barra lateral está colapsada o no
            linkText.nativeElement.style.display = this.collapsed ? 'block' : 'none';
        }
      });
    }
  }
  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-worker']);
    this.updateSidenavLinkTextDisplay();
  }

  handleLogout() {
    // Establecer los estados a false para ocultar inmediatamente los elementos relevantes
    this.isAuthenticated = false;
    this.authChecked = false;
    this.updateSidenavLinkTextDisplay(); // Actualizar la visibilidad antes de proceder con el logout
    this.changeDetectorRef.detectChanges(); // Forzar la actualización de la UI

    this.logout();
    this.closeSidenav();
  }

  checkAuthentication() {
    this.authService.getAuthStatus().subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }
  
}
