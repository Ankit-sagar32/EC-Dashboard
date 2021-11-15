import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../services/core/login.service';

@Injectable({
    providedIn: 'root'
  })  
export class AuthGuard implements CanActivate {
    constructor(private loginService: LoginService,private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.loginService.isLoggedIn || sessionStorage.getItem('login-token')) {
            this.loginService.updateLoginStatus(true);
            return true;
        }
        // not logged in so redirect to login page with the return url and return false
        sessionStorage.clear();
        this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
