import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { NetworkGraph } from "../landing/network-graph/network-graph.component";
import { SankeyComponent } from "../landing/sankey-graph/sankey-graph.component";
import { HeaderComponent } from "../shared/header/header.component";
import { SharedModule } from "../shared/shared.module";
import { TabDetails } from "./tab-details/tab-details.component";
import { TabStart } from "./tab-start/tab-start.component";
import { TabsHeader } from "./tabs-header/tabs-header.component";
import { TabsComponent } from "./tabs.component";

const tabRoutes: Routes = [
    {
        path: '', component: TabsComponent, children: [
            { path: 'start', component: TabStart },
            { path: 'view/:viewName/device/:deviceName/site/:siteName', component: TabDetails }
        ]
    },
];

@NgModule({
    declarations: [
        TabsComponent,        
        TabStart,
        TabDetails,
        TabsHeader,
        NetworkGraph,
        SankeyComponent,
        HeaderComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        RouterModule.forChild(tabRoutes)
    ],
    providers: [{provide: window, useValue: window}]
})
export class TabsModule { }