import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';

const coreRoutes: Routes = [
  { path: "", component: WelcomePageComponent },
  { path: "login", component: LoginComponent },
];

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(coreRoutes)
  ]
})
export class CoreModule { }
