import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginWorkerComponent } from './components/login-worker/login-worker.component';
import { PerfilWorkerComponent } from './components/perfil-worker/perfil-worker.component';
import { SoporteComponent } from './components/soporte/soporte.component';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { NgModule } from '@angular/core';
import { DetallePostingComponent } from './components/detalle-posting/detalle-posting.component';
import { ProfilePostingComponent } from './components/profile-posting/profile-posting.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';


export const appRoutes: Route[] = [
    { path: '', component: HomeComponent },
    { path: 'login-worker', component: LoginWorkerComponent },
    { path: 'perfil-worker', component: PerfilWorkerComponent },
    { path: 'soporte', component: SoporteComponent },
    { path: 'filtros', component: FiltrosComponent },
    { path: 'detalle/:id', component: DetallePostingComponent },
    { path: 'profile/:id', component: ProfilePostingComponent }, 
    { path: '', redirectTo: '/detalle-posting', pathMatch: 'full' },
    { path:'reset-password', component: ResetPasswordComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }