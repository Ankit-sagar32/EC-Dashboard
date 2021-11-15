import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StartUpService } from "src/app/helpers/services";
import { DataService } from "src/app/helpers/services/core/interceptor.service";
import { TabsService } from "../../../helpers/services/tabs.service";
import { ExposureService } from "src/app/helpers/services/exposure.service";

@Component({
    selector: "app-tab-start",
    templateUrl: "./tab-start.component.html",
    styleUrls: ["./tab-start.component.scss"]
})
export class TabStart implements OnInit {
    views: any[] = [{
        name: "Operational View",
        isSelected: true
    },
    {
        name: "CSOC view",
        isSelected: false
    }];

    viewTypes: any[] = [];
    deviceTypes: any[] = [];
    siteNames: any[] = [];
    dataCenters: any[] = [];
    destinationDeviceTypes: any[] = [];
    ise2eSelected: boolean = false;
    enableSearchButton: boolean = false;
    selectedDevice: string = "";
    selectedDeviceType: string = "";
    selectedViewType: string = "";
    constructor(
        private tabsService: TabsService,
        private apiService: DataService,
        private router: Router,
        private startUp: StartUpService,
        private exposureService: ExposureService
    ) { }

    ngOnInit() {
        this.viewTypes = this.tabsService.viewTypes;
    }

    viewToggler(item: any) {
        this.views.map(view => view.isSelected = view.name == item.name)
    }

    onViewTypeChange(event: any) {
        if (event == "Topology View") {
            this.ise2eSelected = false;
            this.deviceTypes = [];
            this.getDeviceTypes(event);
        }

        if (event == "E2E connectivity view") {
            this.ise2eSelected = true;
            this.deviceTypes = [];
            this.getDataCenterNames(event);
        }
        this.selectedViewType = event;
    }

    getDeviceTypes(event: any) {
        this.deviceTypes = [
            {
                name: "Network",
                isSelected: false
            },
            {
                name: "Firewall",
                isSelected: false
            },
            {
                name: "Storage",
                isSelected: false
            }, {
                name: "ESX",
                isSelected: false
            },
            {
                name: "APPID",
                isSelected: false
            },
            {
                name: "VM",
                isSelected: false
            }
        ];
        // this.apiService.post("deviceType", { selectedView: event }).subscribe((res: any) => {
        //     this.deviceTypes = res;
        // });
    }

    getSiteNames(event: any) {
        this.selectedDeviceType = event;
        this.siteNames = [];
        this.exposureService.getSiteNames(event).subscribe((res: any) => {
            if (res && res.nodes.length > 0) {
                let devices: any[] = [];
                res.nodes.map((node: string) => {
                    devices.push({
                        name: node,
                        isSelected: false
                    })
                })
                this.siteNames = devices;
            }
        });
    }

    getDataCenterNames(event: any) {
        this.apiService.post("/getDataCenter", { selectedView: event }).subscribe((res: any) => {
            this.dataCenters = res;
        })
    }

    onDeviceTypeChange(event: any) {
        this.getSiteNames(event);
    }

    onDeviceChange(event: any) {
        this.selectedDevice = event;
        if (!this.ise2eSelected) {
            this.enableSearchButton = true;
        } else {
            this.enableSearchButton = false;
        }
    }

    onDestinationDeviceTypeChange(event: any) {

    }

    onSearchClick() {
        let viewName = this.selectedViewType;
        let deviceName = this.selectedDeviceType;
        let siteName = this.selectedDevice;
        let tabDisplayName = deviceName + "( " + viewName + " - " + siteName + " )";
        let routePath = "/tabs/view/" + viewName + "/device/" + deviceName + "/site/" + siteName;
        let newTab = {
            tabDisplayName: tabDisplayName,
            isActive: true,
            path: routePath
        }
        this.tabsService.addNewTab(newTab).then(res => {
            this.router.navigate([routePath]);
        }).catch(err => {
            console.error("Error occured while adjusting routes: ", err);
        });
    }
}