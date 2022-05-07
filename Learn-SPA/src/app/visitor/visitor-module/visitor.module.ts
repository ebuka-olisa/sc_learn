import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { VisitorHomeComponent } from './components/visitor-home/visitor-home.component';
import { VisitorLayoutComponent } from './components/visitor-layout/visitor-layout.component';
import { VisitorPageNotFoundComponent } from './components/visitor-page-not-found/visitor-page-not-found.component';
import { VisitorRoutingModule } from './visitor-routing.module';
import { VisitorInvestComponent} from './components/visitor-invest/visitor-invest.component';
import { VisitorInvestEmailConfirmationComponent } from './components/visitor-invest-email-confirmation/visitor-invest-email-confirmation.component';
import { VisitorPrivacyComponent } from './components/visitor-privacy/visitor-privacy.component';

@NgModule({
  imports: [
    RouterModule,
    SharedModule,
    VisitorRoutingModule
  ],
  declarations: [
    VisitorLayoutComponent,
    VisitorHomeComponent,
    VisitorInvestComponent,
    VisitorInvestEmailConfirmationComponent,
    VisitorPageNotFoundComponent,
    VisitorPrivacyComponent
  ]
})
export class VisitorModule { }
