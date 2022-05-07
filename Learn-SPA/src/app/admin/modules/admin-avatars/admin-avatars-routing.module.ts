import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../admin-shared/components/admin-layout/admin-layout.component';
import { AdminPageNotFoundComponent } from '../admin-shared/components/admin-page-not-found/admin-page-not-found.component';
import { AdminAvatarsListComponent } from './components/admin-avatars-list/admin-avatars-list.component';
import { AdminAvatarsModalContainerComponent } from './components/admin-avatars-modal-container.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    data: {
      home: '/scl-admin',
      activePage: 'avatars',
      breadcrumb: [{label: 'Avatars', url: ''}]
    },
    children: [
      {
        path: '',
        component: AdminAvatarsListComponent,
        data: {
          showBackButton: false
        },
        children: [
          {
            path: 'add',
            component: AdminAvatarsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Avatars', url: ''}],
              showBackButton: false
            },
          },
          {
            path: ':id',
            component: AdminAvatarsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Avatars', url: ''}],
              showBackButton: false
            },
          }
        ]
      },
      {
        path: '**',
        component: AdminPageNotFoundComponent,
        data: {
          breadcrumb: [
            {label: 'Avatars', url: '/scl-admin/avatars'},
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
export class AdminAvatarsRoutingModule { }
