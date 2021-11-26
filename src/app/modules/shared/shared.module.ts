import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataList } from './data-list/data-list.component';
import { DropDown } from './drop-down/drop-down.component';
import { TableDefault } from './table/table.component';
import { D3_DIRECTIVES } from 'src/app/helpers/directives/network-graph';
import { SHARED_VISUALS } from './network-graph/';
import { GraphComponent } from './network-graph/graph/graph.component';
import { GraphLegendComponent } from './graph-legend/graph-legend.component';



@NgModule({
  declarations: [
    DataList,
    DropDown,
    TableDefault,
    GraphComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES,
    GraphLegendComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    DataList,
    DropDown,
    TableDefault,
    GraphComponent,
    GraphLegendComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES
  ]
})
export class SharedModule { }
