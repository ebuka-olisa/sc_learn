import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { DeleteItemNameConfirmComponent } from './components/delete-item-name-confirm/delete-item-name-confirm.component';
import { ConfirmDeleteComponent } from './components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from './components/show-info/show-info.component';
import { ConfirmExitComponent } from './components/confirm-exit/confirm-exit.component';
import { ModalContainerComponent } from './components/modal-container/modal-container.component';
import { MyPaginationComponent } from './components/my-pagination/my-pagination.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PageWrapperDirective } from './directives/page-wrapper.directive';
import { AdminPageNotFoundComponent } from './components/admin-page-not-found/admin-page-not-found.component';
import { NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { NgSelectizeModule } from 'ng-selectize';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ConfirmPageExitComponent } from './components/confirm-page-exit/confirm-page-exit.component';
import { ConfirmActionComponent } from './components/confirm-action/confirm-action.component';
import { MultiplePicsComponent } from './components/multiple-pics/multiple-pics.component';
import { DropzoneConfigInterface, DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { PreviewVideoComponent } from './components/preview-video/preview-video.component';
import { SinglePictureComponent } from './components/single-picture/single-picture.component';
import { ColorChromeModule} from 'ngx-color/chrome';
import { TabsModule } from 'ngx-bootstrap/tabs';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: '/post',
  acceptedFiles: 'image/*',
  uploadMultiple: false,
  maxFiles: 1,
  clickable: true,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictDefaultMessage: '<i class="fa fa-picture-o"></i>Drop picture here or click to browse'
};

@NgModule({
  imports: [
    RouterModule,
    SharedModule,
    NgbPaginationModule,
    NgbNavModule,
    EditorModule,
    NgSelectizeModule,
    NgbTooltipModule,
    DragDropModule,
    DropzoneModule,
    ColorChromeModule,
    TabsModule.forRoot()
  ],
  exports: [
    SharedModule,
    NgbPaginationModule,
    NgbNavModule,
    MyPaginationComponent,
    EditorModule,
    NgSelectizeModule,
    NgbTooltipModule,
    SafeHtmlPipe,
    DragDropModule,
    MultiplePicsComponent,
    SinglePictureComponent,
    ColorChromeModule,
    TabsModule
  ],
  declarations: [
    AdminLayoutComponent,
    AdminPageNotFoundComponent,
    PageWrapperDirective,
    MyPaginationComponent,
    ModalContainerComponent,
    ConfirmExitComponent,
    ConfirmDeleteComponent,
    ShowInfoComponent,
    DeleteItemNameConfirmComponent,
    ConfirmPageExitComponent,
    ConfirmActionComponent,
    SafeHtmlPipe,
    MultiplePicsComponent,
    PreviewVideoComponent,
    SinglePictureComponent
  ],
  providers: [
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: 'assets/tinymce/tinymce.min.js'
    },
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ]
})
export class AdminSharedModule { }
