import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
const MINUTES_UNITL_AUTO_LOGOUT = 10; // in mins
const CHECK_INTERVAL = 1000; // in ms
const STORE_KEY = 'lastAction';

@Injectable({
    providedIn: 'root'
})

export class AutoLogoutService {
    public getLastAction() {
    return parseInt(sessionStorage.getItem(STORE_KEY) || '{}');
    }

    public setLastAction(lastAction: number) {
    sessionStorage.setItem(STORE_KEY, lastAction.toString());
    }

    constructor(private router: Router) {
    console.log("Auto Logout Service Check");
    this.check();
    this.initListener();
    this.initInterval();
    sessionStorage.setItem(STORE_KEY, Date.now().toString());
    }

    initListener() {
    document.body.addEventListener('click', () => this.reset());
    document.body.addEventListener('mouseover', () => this.reset());
    document.body.addEventListener('mouseout', () => this.reset());
    document.body.addEventListener('keydown', () => this.reset());
    document.body.addEventListener('keyup', () => this.reset());
    document.body.addEventListener('keypress', () => this.reset());
    }

    reset() {
    this.setLastAction(Date.now());
    }

    initInterval() {
    setInterval(() => {
        this.check();
    }, CHECK_INTERVAL);
    }

    check() {
    const now = Date.now();
    const timeleft =
      this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;

    if (isTimeout) {
        sessionStorage.clear();
        this.router.navigate(["login"]);
    }
    }
}
