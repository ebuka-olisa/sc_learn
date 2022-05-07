import { NgModule } from '@angular/core';
import { AdminSharedModule } from '../admin-shared/admin-shared.module';
import { AdminAvatarsRoutingModule } from './admin-avatars-routing.module';
import { AdminAvatarsService } from './admin-avatars.service';
import { AdminAvatarsAddComponent } from './components/admin-avatars-add/admin-avatars-add.component';
import { AdminAvatarsListComponent } from './components/admin-avatars-list/admin-avatars-list.component';

@NgModule({
  imports: [
    AdminSharedModule,
    AdminAvatarsRoutingModule
  ],
  declarations: [
    AdminAvatarsListComponent,
    AdminAvatarsAddComponent
  ],
  providers: [
    AdminAvatarsService
  ]
})
export class AdminAvatarsModule { }
