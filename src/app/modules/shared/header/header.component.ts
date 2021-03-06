import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/helpers/services/core/login.service';
import { MetadataService } from 'src/app/helpers/services/metadata.service';
import { HttpHeaders } from '@angular/common/http';
import { Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  boatId: string = '';
  logoutBool: boolean = false;
  openMenuBool: boolean = false;
  selectedMenu: string = "operation";
  @Output() backgroundBlur = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private loginService: LoginService,
    private metadataService: MetadataService,
  ) { }

  ngOnInit(): void {
    this.boatId = sessionStorage.getItem("boatId")|| '';
    this.loginService.onLoginComplete.subscribe(res => {
      this.isLoggedIn = res;
    });
    
  }

  changeMenu(menuOption: string){
    this.selectedMenu = menuOption;
    this.openMenu();
  }

  openMenu(){
    this.openMenuBool = !this.openMenuBool;
    this.backgroundBlur.emit(this.openMenuBool);
  }

  onClickLogo() {
    if (this.loginService.isLoggedIn) {
      this.router.navigate(["landing/tabs/start"])
    }else {
      this.router.navigate([""]);
    }
  }

  onLogoutClick(){
    this.loginService.updateLoginStatus(false);

    const payload = { "boatId":this.boatId, "sessionId": sessionStorage.getItem("sessionId") || "" };

   
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        .set("Authorization", "Bearer " + sessionStorage.getItem("login-token"))
    }

    this.metadataService.revokeToken(this.boatId, sessionStorage.getItem("login-token") || "", options).subscribe((res: any)=>{
      this.metadataService.postLogout(payload).subscribe((res: any)=>{
        sessionStorage.clear();
      });
    });
    
    this.router.navigate([""]);
  }

}
