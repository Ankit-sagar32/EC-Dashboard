import { Injectable } from '@angular/core';
import { StartUpService } from "src/app/helpers/services";
import { DataService } from "src/app/helpers/services/core/interceptor.service";

@Injectable({
  providedIn: 'root'
})
export class ExposureService {
  exposureUrl: string = '';
  constructor(private apiService: DataService, private startUp: StartUpService) {
    this.exposureUrl = this.startUp.getConfig('exposure');
   }

  getSiteNames(deviceType: string){
    let url = this.exposureUrl + "/nodes/" + deviceType + "/null";
    return this.apiService.get(url);
  }

  getGraphData(deviceName: string, siteName: string) {
    let url = this.exposureUrl + "/nodes/" + deviceName + "/" + siteName + "/1/null/ops";
    return this.apiService.get(url);
  }

  getAlarmData(params: any){
    let url = this.exposureUrl +  "/alarm/api/view";
    // return this.apiService.post(url, params);

    let headerParams = {"Content-Type": "application/json"}
    return this.apiService.postOptions(url, params, {headers: headerParams});
    // return this.apiService.get(url);
  }
}
