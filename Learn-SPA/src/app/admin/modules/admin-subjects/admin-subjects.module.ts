import { AdminSubjectsAddComponent } from './components/admin-subjects-add/admin-subjects-add.component';
import { AdminSubjectsModalContainerComponent } from './components/admin-subjects-modal-container.component';
import { AdminSubjectsService } from './admin-subjects.service';
import { AdminSubjectsListComponent } from './components/admin-subjects-list/admin-subjects-list.component';
import { AdminSharedModule } from './../admin-shared/admin-shared.module';
import { NgModule } from '@angular/core';
import { AdminSubjectsRoutingModule } from './admin-subjects-routing.module';

@NgModule({
  imports: [
    AdminSharedModule,
    AdminSubjectsRoutingModule
  ],
  declarations: [
    AdminSubjectsListComponent,
    AdminSubjectsModalContainerComponent,
    AdminSubjectsAddComponent
  ],
  providers: [
    AdminSubjectsService
  ]
})
export class AdminSubjectsModule { }
