import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageNotFoundComponent } from '../admin-shared/components/admin-page-not-found/admin-page-not-found.component';
import { AdminLoginLayoutComponent } from './components/admin-login-layout/admin-login-layout.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLoginLayoutComponent,
    data: { home: '/scl-admin/login'},
    children: [
      {
        path: '', component: AdminLoginComponent
      },
      {
        path: '**',
        component: AdminPageNotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLoginRoutingModule { }
