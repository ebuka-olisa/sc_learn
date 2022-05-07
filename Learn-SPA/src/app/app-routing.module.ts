import { NgModule } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import { AdminRoutes } from './admin/admin-routes';
import { VisitorRoutes } from './visitor/visitor-route';

// hold all routes
const routes: Routes = [];

// add admin routes
Array.from(AdminRoutes.values()).forEach((value: Route) => {
  routes.push(value);
});

// add visitor routes
Array.from(VisitorRoutes.values()).forEach((value: Route) => {
  routes.push(value);
});

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
