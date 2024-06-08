import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar.component';


interface SidenavToggle{
  screemWidth: number;
  collapsed: boolean;
}

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend-masterfinder';


  isSidenavCollapsed = false;
  screenWidth = 0;
  onToggleSidenav(data: SidenavToggle): void{
    this.screenWidth = data.screemWidth;
    this.isSidenavCollapsed = data.collapsed;
  }
}
