import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../admin-shared/components/admin-layout/admin-layout.component';
import { AdminPageNotFoundComponent } from '../admin-shared/components/admin-page-not-found/admin-page-not-found.component';
import { AdminSubjectsListComponent } from './components/admin-subjects-list/admin-subjects-list.component';
import { AdminSubjectsModalContainerComponent } from './components/admin-subjects-modal-container.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    data: {
      home: '/scl-admin',
      activePage: 'subjects',
      // breadcrumbs: 'Subjects',
      breadcrumb: [{label: 'Subjects', url: ''}]
    },
    children: [
      {
        path: '',
        component: AdminSubjectsListComponent,
        data: {
          // breadcrumb: [{label: 'Subjects', url: ''}], // 'Subjects'
          showBackButton: false
        },
        children: [
          {
            path: 'add',
            component: AdminSubjectsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Subjects', url: ''}], // 'Subjects'
              showBackButton: false
            },
            // canDeactivate: [CanDeactivateGuard]
          },
          {
            path: ':id',
            component: AdminSubjectsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Subjects', url: ''}], // 'Subjects'
              showBackButton: false
            },
            // canDeactivate: [CanDeactivateGuard]
          }
        ]
      },
      {
        path: '**',
        component: AdminPageNotFoundComponent,
        data: {
          breadcrumb: [
            {label: 'Subjects', url: '/scl-admin/subjects'},
            {label: 'Page Not Found', url: ''}
          ],
          showBackButton: false
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSubjectsRoutingModule { }
