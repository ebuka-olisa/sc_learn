import { AdminLoginRoutingModule } from './admin-login-routing.module';
import { AdminSharedModule } from './../admin-shared/admin-shared.module';
import { NgModule } from '@angular/core';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminLoginLayoutComponent } from './components/admin-login-layout/admin-login-layout.component';
import { AdminLoginService } from './admin-login.service';

@NgModule({
  imports: [
    AdminSharedModule,
    AdminLoginRoutingModule
  ],
  declarations: [
    AdminLoginLayoutComponent,
    AdminLoginComponent
  ],
  providers: [
    AdminLoginService
  ]
})
export class AdminLoginModule { }
