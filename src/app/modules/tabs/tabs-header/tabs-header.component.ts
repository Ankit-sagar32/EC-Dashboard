import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TabsService } from "../../../helpers/services/tabs.service";

@Component({
    selector: "app-tabs-header",
    templateUrl: "./tabs-header.component.html",
    styleUrls: ["./tabs-header.component.scss"]
})
export class TabsHeader implements OnInit{
    allTabs:any[] = [];
    constructor(
        private tabsService: TabsService,
        private router: Router
    ) {}

    ngOnInit() {
        this.tabsService.getAllTabs().subscribe(res => {
            this.allTabs = res;
        });
        let activeTab = this.tabsService.tabs.filter(tab => tab.isActive);
    }

    onTabClick(tab:any){
        this.tabsService.tabs.map(item => item.isActive = tab.path === item.path);
        this.tabsService.updateTabs(this.tabsService.tabs);
        this.router.navigate([tab.path]);
    }

    onTabCloseClick(selectedTab:any){
        this.tabsService.tabs = this.tabsService.tabs.filter(tab => tab.tabDisplayName != selectedTab.tabDisplayName && tab.path != selectedTab.path)
        this.onTabClick(this.tabsService.tabs[0]);
    }

     truncate(input: string) {
        if (input.length > 16) {
           return input.substring(0, 16) + '...';
        }
        return input;
     };
}