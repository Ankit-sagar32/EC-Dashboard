import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataService } from './core/interceptor.service';
import { StartUpService } from './core/startup.service';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  loginUrl: string = '';
  revokeTokenUrl: string = '';
  constructor(private apiService: DataService, private startUp: StartUpService) {
    this.loginUrl = this.startUp.getConfig('metadata');
    this.revokeTokenUrl = this.startUp.getConfig('revokeToken')
  }

  getLogin(params: any) {
    let url = this.loginUrl + "" + '/login';
    return this.apiService.post(url, params);
  }

  getToken(options: any) {
    const body = new HttpParams()
      .set('grant_type', "client_credentials");

    let url = this.startUp.getConfig('token');
    return this.apiService.postOptions(url, body.toString(), options);
  }

  revokeToken(ein: string, token: string, options: any){

    let url = this.revokeTokenUrl + ein+ "/revoke/token/" + token;
    const body = new HttpParams()
    .set('grant_type', "client_credentials");

    return this.apiService.putOptions(url, body.toString(), options);
  }

  getLogout(params: any){
    let url = this.loginUrl + "" + '/logout';
    return this.apiService.post(url, params);
  }
}
