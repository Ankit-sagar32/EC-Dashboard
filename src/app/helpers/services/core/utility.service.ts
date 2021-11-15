import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})

/**
 * @author Ankit
 */
export class UtilityService {


  constructor() { }

  // Removes duplicates from the given array of objects with the provided identifier
  removeDuplicates(array:any[], identifier:string):any[]{
    let returnVal : any[] = [];
    if(array.length > 0 && identifier){
      returnVal = array.filter((item, index, self) => {
        let itemIndex = self.findIndex((t:any) => t[identifier] == item[identifier]);
        return itemIndex === index
      });
    }
    return returnVal;
  }
  
  countOccurrence(array:any[], identifier:string):any[]{
    let returnVal : any[] = [];
    if(array.length > 0 && identifier){
      returnVal = array.filter((item, index, self) => {
        let itemIndex = self.findIndex((t:any) => t[identifier] == item[identifier]);
        return itemIndex === index
      });
      let counts: any = {}; 
      array.forEach((item) => { counts[item[identifier]] = (counts[item[identifier]] || 0) + 1; });
      returnVal.forEach(item => {item.count = counts[item[identifier]]});
    }

    return returnVal;
  }
  getPropertyValue(node: any, propertyName: string) {
    return node.find((p: any) => p["name"] == propertyName)?.["value"];
  }

}
