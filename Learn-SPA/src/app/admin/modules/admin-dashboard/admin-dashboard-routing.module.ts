import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../admin-shared/components/admin-layout/admin-layout.component';
import { AdminPageNotFoundComponent } from '../admin-shared/components/admin-page-not-found/admin-page-not-found.component';
import { AdminDashboardComponent } from './admin-dashboard.component';

const routes: Routes = [
  {
      path: '',
      component: AdminLayoutComponent,
      data: {
          home: '/scl-admin',
          activePage: 'dashboard',
          // breadcrumb: 'Dashboard'
          breadcrumb: [{label: 'Dashboard', url: ''}]
      },
      children: [
      {
          path: '',
          component: AdminDashboardComponent,
          data: {
            // breadcrumbs: 'Dashboard', // [{label: 'Dashboard', url: ''}],
            showBackButton: false
          },
          resolve: {}
      },
      {
          path: '**',
          component: AdminPageNotFoundComponent,
          data: {
            breadcrumb: [
                {label: 'Dashboard', url: '/scl-admin'},
                {label: 'Page Not Found', url: ''}
            ]
          }
      }
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule { }
