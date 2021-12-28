import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StartUpService } from "src/app/helpers/services";
import { DataService } from "src/app/helpers/services/core/interceptor.service";
import { TabsService } from "../../../helpers/services/tabs.service";
import { ExposureService } from "src/app/helpers/services/exposure.service";
import { AutoLogoutService } from "src/app/helpers/services/core/auto-logout.service";

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
    selectedSiteNameID: string = '';
    selectedDeviceID: string = '';
    selectedDeviceName: string = '';
    selectedSiteNameDataCenter:string = '';
    
    dataCenters: any[] = [];
    destinationDeviceTypes: any[] = [];
    destsiteNames: any[] = [];
    destinationData: any = [];
    ise2eSelected: boolean = false;
    isSourceSelected: boolean = false;
    enableSearchButton: boolean = false;
    selectedDevice: string = "";
    selectedDestDevice: string = "";
    selectedDeviceType: string = "";
    selectedDestDeviceType: string = "";
    selectedViewType: string = "";
    selectedDataCenter: string = "";
    constructor(
        private tabsService: TabsService,
        private apiService: DataService,
        private router: Router,
        private startUp: StartUpService,
        private exposureService: ExposureService,
        private autoLogout: AutoLogoutService
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
            this.dataCenters = [];
            this.deviceTypes = [];
            this.siteNames = [];
            // this.getDeviceTypes(event);
            
            this.getDataCenterNames(event);
        }

        if (event == "E2E connectivity view") {
            this.ise2eSelected = true;
            this.isSourceSelected = false;
            this.dataCenters = [];
            this.deviceTypes = [];
            this.siteNames = [];
            this.destinationDeviceTypes = [];
            this.destsiteNames = [];
            this.getDataCenterNames(event);
        }
        this.selectedViewType = event;
    }

    getDeviceTypes(event: any) {
        this.selectedDataCenter = event;
        this.siteNames = [];
        this.destinationDeviceTypes = [];
        this.destsiteNames = [];
    }

    getSiteNames(event: any) {
        this.selectedDeviceType = event;
        this.siteNames = [];
        this.exposureService.getSiteNames( this.selectedDeviceType, this.selectedDataCenter).subscribe((res: any) => {
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

    getdeviceIDsBySitename(event: any) {
        this.selectedDeviceType = event;
        this.siteNames = [];        
        this.destinationDeviceTypes = [];
        this.destsiteNames = [];
        this.exposureService.getdeviceIDsBySitename(this.selectedDeviceType, this.selectedDataCenter).subscribe((res: any) => {
                
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

    createIsSelectedArray(data: any) {
        let dataArray = data;
        let isSelectableArray : any[] = [];
        for (let index = 0; index < dataArray.length; index++) {
            const element = dataArray[index];
            isSelectableArray.push({
                    name: element,
                    isSelected: false
                })
        }
        return isSelectableArray;
    }

    getDataCenterNames(event: any) {
        this.exposureService.getDataCentersData().subscribe((res: any) => {
            if (res ) {
                let deviceTypesArray =  res?.deviceTypes;
                let dataCentersArray =  res?.dataCenters;

                this.dataCenters = this.createIsSelectedArray(dataCentersArray);
                this.deviceTypes = this.createIsSelectedArray(deviceTypesArray);
                this.siteNames = [];
            }
        });
    }

    onDeviceTypeChange(event: any) {
        this.selectedDeviceType = event;
        this.siteNames = [];
        this.destinationDeviceTypes = [];
        this.destsiteNames = [];

        if(this.ise2eSelected)
            this.getdeviceIDsBySitename(event);
        else
            this.getSiteNames(this.selectedDeviceType);
    }

    onDeviceChange(event: any) {
        this.selectedDevice = event;
        if (!this.ise2eSelected) {
            this.enableSearchButton = true;
        } else {
            this.enableSearchButton = false;
            this.destinationDeviceTypes = [];
            this.destsiteNames = [];
            this.isSourceSelected = true;
            this.getAllDestinationDeviceBySourceID();
        }
    }

    onDestDeviceChange(event: any) {
        this.selectedDestDevice = event;
        if (this.ise2eSelected) {
            this.enableSearchButton = true;
        }
    }

    getAllDestinationDeviceBySourceID()
    {
        let viewName = this.selectedViewType;
        let deviceName = this.selectedDeviceType;
        let deviceID = this.selectedDevice;
        let hopcount = '6';
        let sitename = this.selectedDataCenter;
        this.exposureService.getDatabySourceIDData(deviceName, deviceID, hopcount, sitename ).subscribe((res: any) => {
                
            if (res && res.nodes.length > 0) {
                let destDeviceNames: any[] = [];
                var destinationDevicetypes: any[] = [];
                this.destinationData = res;
                res.nodes.map((node: any) => {
                    if (Object.values(destinationDevicetypes).indexOf(node.type) == -1) {
                            destinationDevicetypes.push({
                            name: node.type,
                            isSelected: false
                        })
                    }
                    if (Object.values(destDeviceNames).indexOf(node.name) == -1) {
                        destDeviceNames.push({
                            name: node.name,
                            isSelected: false
                        })
                    }
                })
                // get all destination device types
                destinationDevicetypes = destinationDevicetypes.filter((node, index, self) =>
                    index === self.findIndex((t) => (
                        t.name === node.name
                    ))
                )

                // get unique destination deviceIds
                destDeviceNames = destDeviceNames.filter((node, index, self) =>
                    index === self.findIndex((t) => (
                        t.name === node.name
                    ))
                )

                this.destinationDeviceTypes = destinationDevicetypes;
                // this.destsiteNames = destDeviceNames;
            }
        });
    }

    onDestinationDeviceTypeChange(event: any) {
        this.selectedDestDeviceType = event;
        this.destsiteNames = [];
        let destDeviceNames: any[] = [];
        if(this.destinationData) {
            this.destinationData.nodes.map((node: any) => {
                if(node.type == this.selectedDestDeviceType){
                    destDeviceNames.push({
                        name: node.name,
                        isSelected: false
                    })
                }
            })
            this.destsiteNames = destDeviceNames;
        }
    }

    onSearchClick() {
        if(this.enableSearchButton){
            let viewName = this.selectedViewType;
            let deviceName = this.selectedDeviceType;
            let siteName = this.selectedDevice;
    
            let destinationDeviceType = this.selectedDestDeviceType;
            let destinationDeviceID = this.selectedDestDevice;
            let selectedsitename = this.selectedDataCenter;
    
            if(!this.ise2eSelected) 
            {
    
                let tabDisplayName = deviceName + "( " + viewName + " - " + siteName + " )";
                let routePath = "/landing/tabs/view/" + viewName + "/device/" + deviceName + "/site/" + siteName;
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
            else {
                let sourceID = this.selectedDevice;
                let destinationDeviceID = this.selectedDestDevice;
                
                let tabDisplayName = deviceName + "( " + viewName + " - " + sourceID + " )";
                // let tabDisplayName = deviceName + "( " + viewName + " - " + sourceID + " - " + destinationDeviceID + " )";
                let routePath = "/landing/tabs/view/" + viewName + "/device/" + deviceName + "/site/" + siteName + 
                "/sourceid/" + sourceID + "/destid/" + destinationDeviceID + "/datacenter/"+ selectedsitename;
                let newTab = {
                    tabDisplayName: tabDisplayName,
                    isActive: true,
                    path: routePath
                }
    
                this.tabsService.addNewTab(newTab).then(res => {
                    this.router.navigate([routePath]);

                    // this.router.navigate([routePath, {
                    //                     ise2eSelected: this.ise2eSelected, 
                    //                     sourceID: sourceID,
                    //                     destinationID: destinationDeviceID,
                    //                     datacenter: selectedsitename
                    //                 }]);
                }).catch(err => {
                    console.error("Error occured while adjusting routes: ", err);
                });
    
            }
        }
    }
}