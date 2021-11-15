import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    isLoggedIn: boolean = false;

    onLoginComplete : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isLoggedIn);

    updateLoginStatus(status:boolean) {
        this.isLoggedIn = status;
        this.onLoginComplete.next(this.isLoggedIn);
    }
}