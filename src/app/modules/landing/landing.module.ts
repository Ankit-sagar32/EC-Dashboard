import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { AuthGuard } from '../../helpers/guards/index';

const childRoutes: Routes = [
  {
    path: '', component: LandingComponent, canActivate: [AuthGuard]
  },
  {
    path: 'landing', component: LandingComponent, canActivate: [AuthGuard]
  }
];


@NgModule({
  declarations: [
    LandingComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(childRoutes),
  ]
})
export class LandingModule { }
