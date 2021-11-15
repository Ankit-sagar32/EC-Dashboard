import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/helpers/services/core/login.service';
import { LoginHeaderComponent } from 'src/app/modules/shared/login-header/login-header/login-header.component';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit {

  constructor(
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
  }

  onEnterClick() {
      this.router.navigate(["login"]);
    }
}
