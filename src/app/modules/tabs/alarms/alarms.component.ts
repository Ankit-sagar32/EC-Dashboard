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

  @Input() selectedNodeInventoryDetails: any ; 
  nodeDetailsProperties: any;
  
  constructor(private startUp: StartUpService,
    private exposureService: ExposureService,
    private dataSvc: DataService) {
     let exposureUrl= this.startUp.getConfig('exposure');
     let Url = new URL(exposureUrl);
   }

   ngOnInit(): void {
      this.nodeDetailsProperties = this.selectedNodeInventoryDetails;
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

}
