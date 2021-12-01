import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StartUpService } from "src/app/helpers/services";
import { ExposureService } from 'src/app/helpers/services/exposure.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit,OnChanges {

  @Input() selectedNodeInventoryDetails: any ; 
  entityHrefData: any;
  locationhost: string = '';
  
  constructor(private startUp: StartUpService,
    private exposureService: ExposureService) {
     let exposureUrl= this.startUp.getConfig('exposure');
     let Url = new URL(exposureUrl);
     this.locationhost = Url.origin;
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedNodeInventoryDetails.currentValue) {
      let entityHrefUrl = changes.selectedNodeInventoryDetails.currentValue?.entityHref;
      
      this.exposureService.getInventoryEntityData(entityHrefUrl, this.locationhost).subscribe((res: any) => {
        let nodeProperties = res.nodes || [];
        this.entityHrefData = nodeProperties[0]?.properties;
      });
    }
  }

  ngOnInit(): void {
  }

}
