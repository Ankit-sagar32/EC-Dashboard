import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate() {
        if (!sessionStorage.getItem('login-token')) {
            // logged in so return true
            return true;
        }
        // logged in so redirect to login page
        this.router.navigate(['tabs/start']);
        return false;
    }

}
