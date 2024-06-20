import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpClientModule } from '@angular/common/http'; // No necesitas HttpClient aquí
import { AppRoutingModule } from './app.routes';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    AppRoutingModule,
    HttpClientModule // Asegúrate de tener solo HttpClientModule aquí
  ],
  providers: [CookieService], // Puedes agregar HttpClient aquí si lo necesitas, pero no es obligatorio
  bootstrap: [AppComponent],
})
export class AppModule {}
