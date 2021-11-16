import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class DataService {

  isFormattedJSONDataType:boolean= true;

  onDataTypeSelectionChange : BehaviorSubject<any> = new BehaviorSubject("");
  private childClickedEvent = new BehaviorSubject<any>('');

  constructor(private http: HttpClient) { }

  /**
   * API service stub
   */
  fetchUserFlowData(api:any): Observable<any> {
    return this.http.get<any>(api);
  }

  getNodeDetails(node:any, reqField:string){
    let returnVal = "";
    if(node && reqField){
        let reqProp = node.properties.filter((item:any) => item.name == reqField)[0];
        if(reqProp.value){
            returnVal = reqProp.value;
        }
    }
    return returnVal;
  }

  emitChildEvent(msg: string){
    this.childClickedEvent.next(msg)
 }

 childEventListner(){
    return this.childClickedEvent.asObservable();
  } 

}
