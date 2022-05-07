import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { InterceptorProviders } from '../admin/interceptors/interceptor-providers';
import { NgDynamicBreadcrumbModule } from 'ng-dynamic-breadcrumb';
import { CodeEditorModule } from '@ngstack/code-editor';
import { Ng2TelInputModule } from 'ng2-tel-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
    BsDropdownModule.forRoot(),
    NgDynamicBreadcrumbModule,
    ToastrModule.forRoot({
      maxOpened: 2,
      positionClass: 'toast-top-right',
      timeOut: 4000,
      closeButton: true,
      preventDuplicates: true,
      enableHtml: true
    }),
    HttpClientModule,
    // CodeEditorModule.forRoot({
      // baseUrl: 'assets/monaco'
    // }), // offline
    CodeEditorModule.forRoot() // online
  ],
  exports: [
    CommonModule,
    NgbDropdownModule,
    NgbCollapseModule,
    BsDropdownModule,
    NgDynamicBreadcrumbModule,
    FormsModule,
    CodeEditorModule,
    Ng2TelInputModule
  ],
  declarations: [],
  providers: [
    InterceptorProviders
  ]
})
export class SharedModule { }
