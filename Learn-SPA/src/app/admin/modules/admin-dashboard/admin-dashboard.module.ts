import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { AdminSharedModule } from './../admin-shared/admin-shared.module';
import { NgModule } from '@angular/core';
import { AdminDashboardComponent } from './admin-dashboard.component';

@NgModule({
  imports: [
    AdminSharedModule,
    AdminDashboardRoutingModule
  ],
  declarations: [
    AdminDashboardComponent
  ]
})
export class AdminDashboardModule { }
