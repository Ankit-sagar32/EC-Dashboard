import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/helpers/services/core/login.service';
import { EncryptDecryptService } from 'src/app/helpers/services/encrpyt-decrypt-service.service';
import { MetadataService } from 'src/app/helpers/services/metadata.service';
import { NotificationService } from 'src/app/helpers/services/core/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  boatId: string = "";
  password: string = "";
  domain: string = "";
  toggleViewPwd: boolean = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private metadataService: MetadataService,
    private encryptDecryptService: EncryptDecryptService,
    private toastr: NotificationService
  ) { }

  ngOnInit(): void {
  }

  togglerViewPwdHandler(inp: HTMLInputElement) {
    this.toggleViewPwd = !this.toggleViewPwd;
    inp.type = this.toggleViewPwd ? "text" : "password";
  }

  onLoginClick() {
    if (this.boatId && this.password && this.domain) {
      sessionStorage.setItem("userdetails", "loggedin");
      sessionStorage.setItem("boatId", this.boatId);
      var encrypted = this.encryptDecryptService.set('123456$#@$^@1ERF', this.password);
      var decrypted = this.encryptDecryptService.get('123456$#@$^@1ERF', encrypted);

      console.log('Encrypted :' + encrypted);
      console.log('Decrypted :' + decrypted);
      navigator.userAgent
      //TODO : UIVersion
      const uiVersion = "94";
      const userAgent = navigator.userAgent;
      const payload = { domain: this.domain, boatId: this.boatId, password: btoa(this.password), uiVersion: uiVersion, userAgent: userAgent }

      this.metadataService.getLogin(payload).subscribe((response: any) => {
        console.log(response);
        sessionStorage.removeItem("login-token");
        let options = {
          headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
            .set("Authorization", "Basic " + btoa(this.boatId + ":"))
        }
        this.metadataService.getToken(options).subscribe((res: any) => {
          sessionStorage.setItem("login-token", res.token);
          this.loginService.updateLoginStatus(true);
          this.router.navigate(["tabs/start"]);
        });
      });
    } else {
      // alert("All fields are mandatory, please check and try again!");
      if (!this.boatId) {
        this.toastr.showErrorToaster("Please enter Username");
      }
      if (!this.domain) {
        this.toastr.showErrorToaster("Please enter Domain");
      }
      if (!this.password) {
        this.toastr.showErrorToaster("Please enter Password");
      }
    }
  }

  onClickListener(event: any) {
    console.log("on login click: ", event);
  }

}
