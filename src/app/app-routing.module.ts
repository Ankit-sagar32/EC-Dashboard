import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './helpers/services/core/interceptor.service';
import { WelcomePageComponent } from './core/welcome-page/welcome-page.component';
import { LoginComponent } from './core/login/login.component';
import { AuthGuard } from './helpers/guards';

const routes: Routes = [

  // { path: "login", component: LoginComponent },
  // {
  //   path: 'login', loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
  // },

  // { path: "", component: WelcomePageComponent },
  {
    path: '', loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
  },
  {
    path: 'landing', loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule),
  },

  // {
  //   path: 'tabs', loadChildren: () => import('./modules/tabs/tabs.module').then(m => m.TabsModule),
  //   // canActivate: [AuthGuard]
  // },
  { path: "**", component: WelcomePageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: InterceptorService,
    multi: true
  }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
