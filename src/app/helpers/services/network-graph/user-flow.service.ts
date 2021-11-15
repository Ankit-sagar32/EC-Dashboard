import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class UserFlowService {

  constructor(private http: HttpClient) { }

  /**
   * API service stub
   */
  fetchUserFlowData(fileName:any): Observable<any> {
    return this.http.get('assets/data/' + fileName);
  }

}
