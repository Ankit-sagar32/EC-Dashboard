import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DataService } from "./core/interceptor.service";

@Injectable({
    providedIn: 'root'
})
export class TabsService {
    getTabs = new BehaviorSubject<any[]>([]);
    tabs: any[] = [
        {
            tabDisplayName: "Start",
            isActive: true,
            path: "/tabs/start"
        }
    ];

    viewTypes: any[] = [
        {
            name: "Topology View",
            isSelected: true
        },
        {
            name: "E2E connectivity view",
            isSelected: false
        }
    ]

    constructor(private api: DataService){

    }

    async addNewTab(tab:any){
        await this.tabs.map(item => item.isActive = item.tabDisplayName == tab.tabDisplayName);
        if(!this.tabs.find(item => item.tabDisplayName == tab.tabDisplayName))
            await this.tabs.push(tab);
        await this.getTabs.next(this.tabs);
    }

    updateTabs(tabs: any[]){
        if(tabs.length > 0){
            this.tabs = tabs;
            this.getTabs.next(this.tabs);
        }
    }

    getAllTabs() {
        this.getTabs.next(this.tabs);
        return this.getTabs;
    }

}