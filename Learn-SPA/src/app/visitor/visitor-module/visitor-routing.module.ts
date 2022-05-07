import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitorHomeComponent } from './components/visitor-home/visitor-home.component';
import { VisitorLayoutComponent } from './components/visitor-layout/visitor-layout.component';
import { VisitorPageNotFoundComponent } from './components/visitor-page-not-found/visitor-page-not-found.component';
import { VisitorInvestComponent } from './components/visitor-invest/visitor-invest.component';
import { VisitorInvestEmailConfirmationComponent } from './components/visitor-invest-email-confirmation/visitor-invest-email-confirmation.component';
import { VisitorPrivacyComponent } from './components/visitor-privacy/visitor-privacy.component';

const routes: Routes = [
    {
        path: '',
        component: VisitorLayoutComponent,
        data: {
            home: '/',
            activePage: 'home',
            breadcrumb: [{label: 'Home', url: ''}]
        },
        children: [
            {
                path: '',
                component: VisitorHomeComponent,
                data: {
                // breadcrumbs: 'Dashboard', // [{label: 'Dashboard', url: ''}],
                showBackButton: false
                },
                resolve: {}
            },
            {
                path: 'privacy',
                component: VisitorPrivacyComponent,
                data: {
                // breadcrumbs: 'Dashboard', // [{label: 'Dashboard', url: ''}],
                showBackButton: false
                },
                resolve: {}
            },
            {
                path: 'invest',
                component: undefined,
                children: [
                    {
                        path: '',
                        component: VisitorInvestComponent,
                        data: {
                            breadcrumb: [
                                {label: 'Home', url: '/'},
                                {label: 'Invest', url: ''}
                            ]
                        },
                        resolve: {}
                    },
                    {
                        path: 'email-confirmation',
                        component: VisitorInvestEmailConfirmationComponent,
                        data: {
                            breadcrumb: [
                                {label: 'Home', url: '/'},
                                {label: 'Invest', url: '/invest'},
                                {label: 'Email Confirmation', url: ''}
                            ]
                        },
                        resolve: {}
                    }
                ]
            },
            {
                path: '**',
                component: VisitorPageNotFoundComponent,
                data: {
                    breadcrumb: [
                        {label: 'Home', url: '/'},
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
export class VisitorRoutingModule { }
