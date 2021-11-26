import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/helpers/services/network-graph/data.service';

@Component({
  selector: 'app-graph-legend',
  templateUrl: './graph-legend.component.html',
  styleUrls: ['./graph-legend.component.scss']
})
export class GraphLegendComponent implements OnInit {

  constructor(private dataSvc: DataService) { }
  legends:any = [];
  
  ngOnInit(): void {
    this.dataSvc.legendListner().subscribe(legend => {
      this.legends = legend;
    })
  }

  toggleType(legendIndex: number) {
    this.legends[legendIndex].selected = !this.legends[legendIndex].selected;
    this.dataSvc.emitLegendUpdate(this.legends);
  }

}
