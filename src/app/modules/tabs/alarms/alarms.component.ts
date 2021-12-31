import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { StartUpService } from "src/app/helpers/services";
import { ExposureService } from 'src/app/helpers/services/exposure.service';
import { DataService } from 'src/app/helpers/services/network-graph/data.service';

@Component({
  selector: 'app-alarms',
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.scss']
})
export class AlarmsComponent implements OnInit {

  @Input() selectedNodeAlarmDetails: any ; 
  nodeDetailsProperties: any;
  
  constructor(private startUp: StartUpService,
    private exposureService: ExposureService,
    private dataSvc: DataService) {
     let exposureUrl= this.startUp.getConfig('exposure');
     let Url = new URL(exposureUrl);
   }

   valuesToBeShown : any[] = [
    "TroubleTicketID",
    "Owner",
    "EventType",
    "IsProblem",
    "UserDefined1",
    "InstanceDisplayName",
    "UserDefined5",
    "ElementClassName",
    "UserDefined2",
    "Name",
    "ElementName",
    "EventText",
    "LastChangedAt",
    "User",
    "ActionType",
    "Text",
    "InstanceName",
    "Active",
    "SourceDomainName",
    "UserDefined20",
    "Acknowledged",
    "IsRoot",
    "isFlapping",
    "EventDisplayName",
    "Source",
    "ClassName",
    "UserDefined10",
    "FirstNotifiedAt",
    "EventState",
    "Severity",
    "EventName"
  ];

   ngOnInit(): void {
      // this.nodeDetailsProperties = this.selectedNodeAlarmDetails;
      this.filterData()
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    filterData() {
      var filteredObj = JSON.parse(JSON.stringify(this.selectedNodeAlarmDetails));
      if (typeof this.selectedNodeAlarmDetails === 'object' && this.selectedNodeAlarmDetails !== null) {
      Object.keys(this.selectedNodeAlarmDetails).forEach((e) => {
        console.log(e);
        if(this.valuesToBeShown.indexOf(e) == -1){
          delete filteredObj[e];
        }
      });
      }
    
      this.nodeDetailsProperties = JSON.parse(JSON.stringify(filteredObj));
    }
}
