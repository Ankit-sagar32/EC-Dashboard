import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataList } from './data-list/data-list.component';
import { DropDown } from './drop-down/drop-down.component';
import { TableDefault } from './table/table.component';
import { D3_DIRECTIVES } from 'src/app/helpers/directives/network-graph';
import { SHARED_VISUALS } from './network-graph/';
import { GraphComponent } from './network-graph/graph/graph.component';
import { GraphLegendComponent } from './graph-legend/graph-legend.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMaterialModule } from "../shared/material.module";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import { SelectMultipleComponent } from './select-multiple/select-multiple.component';
@NgModule({
  declarations: [
    DataList,
    DropDown,
    TableDefault,
    GraphComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES,
    GraphLegendComponent,
    SelectMultipleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatMaterialModule
  ],
  exports: [
    DataList,
    DropDown,
    SelectMultipleComponent,
    TableDefault,
    GraphComponent,
    GraphLegendComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }]
})
export class SharedModule { }
