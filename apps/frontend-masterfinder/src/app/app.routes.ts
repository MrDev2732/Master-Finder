import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginWorkerComponent } from './components/login-worker/login-worker.component';
import { PerfilWorkerComponent } from './components/perfil-worker/perfil-worker.component';
import { NgModule } from '@angular/core';


export const appRoutes: Route[] = [
    { path: '', component: HomeComponent },
    { path: 'login-worker', component: LoginWorkerComponent },
    { path: 'perfil-worker', component: PerfilWorkerComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }