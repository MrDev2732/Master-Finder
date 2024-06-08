import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  
  @ViewChild('sidenavLinkText') sidenavLinkText!: ElementRef;
  @Output() onToggleSidenav: EventEmitter<SidenavToggle> = new EventEmitter();
  collapsed = false;
  screemWidth = 0;

  constructor() {
    // Recuperar el estado de 'collapsed' desde localStorage
    const savedState = localStorage.getItem('collapsed');
    this.collapsed = savedState === 'true';
  }

  ngAfterViewInit() {
    // Asegurarse de que el display del elemento se actualice al iniciar
    this.updateSidenavLinkTextDisplay();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screemWidth: this.screemWidth });
    console.log("abierto");
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
    if (this.sidenavLinkText) {
      this.sidenavLinkText.nativeElement.style.display = this.collapsed ? 'block' : 'none';
    }
  }
}

