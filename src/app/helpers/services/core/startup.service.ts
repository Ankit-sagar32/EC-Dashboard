import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UrlConfig } from '../../../../environments/environment';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
/**
 * @author Ankit
 */
export class StartUpService {
  loading = false;
  error = '';
  private appConfig: any = {};
  public baseUrl: any;
  public hostConfigUrl: any;

  constructor() {
    this.baseUrl = UrlConfig.baseUrl;
  }

  public getUrlSettings() {
    const protocol = window.location.protocol;
    const hostIp = window.location.host;
    const pathName = window.location.pathname;
    // const namespace = pathName.split('/ec-dashboard-ui/ui/')[0];
    const url = protocol + '//' + hostIp;
    this.appConfig = this.getAppConfiguration(url);
  }

  getConfig(urlName: any) {
    return this.appConfig[urlName];
  }

  getAppConfiguration(configUrls: any): Observable<any> {
    const appConfig: any = {};
    if (!configUrls.includes('localhost')) {
      this.hostConfigUrl = configUrls;
      for (const url in this.baseUrl) {
        if (url !== 'OTHER') {
          appConfig[url] = configUrls + this.baseUrl[url];
        }
      }
      appConfig["hostbaseurl"] = this.hostConfigUrl;
    } else {
      const localEnv = UrlConfig['localhost:4200'].configuration;
      this.hostConfigUrl = localEnv;
      for (const url in this.baseUrl) {
        if (url !== 'OTHER') {
          appConfig[url] = localEnv + this.baseUrl[url];
        }
      }
      appConfig["hostbaseurl"] = this.hostConfigUrl;
    }
    return appConfig;
  }
}
