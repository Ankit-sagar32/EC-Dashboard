import { Component, ElementRef, OnInit, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StartUpService, UtilityService } from "src/app/helpers/services";
import { TabsService } from "../../../helpers/services/tabs.service";
import { ExposureService } from "src/app/helpers/services/exposure.service";
import { DataService } from "src/app/helpers/services/network-graph/data.service";
import { SankeyComponent } from "../../landing/sankey-graph/sankey-graph.component";
import { NetworkGraph } from "../../landing/network-graph/network-graph.component";
import { GraphComponent } from "../../shared/network-graph/graph/graph.component";
import {InventoryComponent} from "../inventory/inventory.component";
@Component({
    selector: "app-tab-details",
    templateUrl: "./tab-details.component.html",
    styleUrls: ["./tab-details.component.scss"]
})
export class TabDetails implements OnInit {
    viewName: string = "";
    deviceName: string = "";
    siteName: string = "";
    graphData: any;
    deviceTypes: any[] = [];
    deviceNames: any[] = [];
    selectedDeviceType: string = "";
    selectedDeviceNames: string = "";

    graphToLoad: string = "radial-view";
    toggleGraphSettings: boolean = false;
    alarms: any[] = [];
    alarmsOptions: any[] = [];
    insights = {"alarmCount":0, "deviceCount":27, "alarmDeviceCount":0};
    alarmsTableColumns: any[] = [];
    entityTableColumns: any[] = [];
    serviceTableColumns: any[] = [];
    showGraph: boolean = true;

    expandTopologyBool: boolean = true;
    expandAlarmsBool: boolean = true;
    displayTabComp: string = "native";
    selectedValue: string = "";
    dataList :any[] = [];
    placeHolderText: string = "Search";
    nodetabs: any[] = [];


    @ViewChild('alarmsWrapper') alarmsWrapper!: ElementRef ;
    @ViewChild('graphsWrapper') graphsWrapper!: ElementRef ;

    @ViewChild(SankeyComponent ) sankeyGraph: SankeyComponent | undefined ; 
    @ViewChild(NetworkGraph ) radialGraph: NetworkGraph | undefined ; 
    @ViewChild(InventoryComponent) inventoryComponent: InventoryComponent | undefined;

    showNodeInfoPopUp: boolean = false;
    nodeInfoPopUp: any = {};
    ip: any;
    deviceType: any;
    dc:any;
    ifClicked: boolean = false;
    selectedNodeData: any;

    inventory : any = null;
    inventoryFlag : boolean = false;

    constructor(
        private tabService: TabsService,
        private route: ActivatedRoute,
        private router: Router,
        private exposureService: ExposureService,
        private startUp: StartUpService, 
        private utilityService : UtilityService,
        private renderer: Renderer2,
        private dataSvc: DataService
    ) {
        this.route.params.subscribe(res => {
            console.log("Route Params: ", res);
            if (res.deviceName && res.siteName && res.viewName) {
                this.deviceName = res.deviceName;
                this.siteName = res.siteName;
                this.viewName = res.viewName
                this.updateGraphData();
            } else {
                // if required route params not found navigate back to graph selection.
                this.router.navigate(["/tab/start"]);
            }
        })
    }

    ngOnInit() {
      this.updateGraphData();
      let clickedNodeData: any;
      this.dataSvc.childEventListner().subscribe(info =>{
        clickedNodeData = info;
        var d = document.getElementById('node-popup');
        if(clickedNodeData?.searched) {
            this.showNodeInfoPopUp = false;
            const deviceName = clickedNodeData.node?.name;
            const deviceType = clickedNodeData.node?.type;
            this.getGraphData(deviceType,deviceName);
        }
        else if(clickedNodeData?.node && !clickedNodeData.searched) {
            this.selectedNodeData = clickedNodeData;
            this.nodeInfoPopUp.Name = clickedNodeData.node.name;
            this.nodeInfoPopUp.Type = clickedNodeData.node.type;
            this.nodeInfoPopUp.Ip = this.utilityService.getPropertyValue(clickedNodeData?.node, "ip") || "NA";
            this.nodeInfoPopUp.DC = this.utilityService.getPropertyValue(clickedNodeData?.node, "group") || "NA";
            this.nodeInfoPopUp.links = ""; // ADD the links in similar way
            var d = document.getElementById('node-popup');
            if(d){
                d.style.left = clickedNodeData.posX +'px';
                d.style.top = clickedNodeData.posY +'px';
            }
            d?.focus();
            this.showNodeInfoPopUp = true; 
        } else {
            this.showNodeInfoPopUp = false;
        }
        if(d) d.style.display = this.showNodeInfoPopUp? "block": "none";
     })
    }

    ngAfterViewInit() {
    }

    updateGraphData() {
      let path = decodeURI(location.pathname);
      let tabname = this.deviceName + "( " + this.viewName + " - " + this.siteName + " )";
      let currentTabDetails = this.tabService.tabs.find(tab => tab.tabDisplayName == tabname && tab.path == path)
      if(currentTabDetails && currentTabDetails.tabGraphData) {
        this.graphData = currentTabDetails.tabGraphData;
        this.getAlarmsData();
        this.deviceTypes = this.utilityService.countOccurrence(this.graphData.nodes, "type").map((m: any) => ({isSelected: false, name: m.type}));
        this.deviceNames = [];
        this.resetGraph();
        return;
      }
      if (!currentTabDetails) {
          // Add the current tab to the tabs service data - (While navigated via Deeplinking).
          this.tabService.addNewTab({
              tabDisplayName: tabname,
              isActive: true,
              path: path
          });
      }
      this.getGraphData();
    }
    onPopUpOut() {
        this.showNodeInfoPopUp = false;
        var d = document.getElementById('node-popup');
        if(d) d.style.display = "none";
    }
    getGraphData(deviceName?: any, siteName?: any) {
        this.exposureService.getGraphData(deviceName? deviceName: this.deviceName, siteName? siteName: this.siteName).subscribe((res: any) => {
          this.graphData = res;
          this.graphData.nodes.forEach((m: any) => {m.type = m.type || this.utilityService.getPropertyValue(m, "nodeType"); m.name = m.name || this.utilityService.getPropertyValue(m, "deviceName");});
          this.getAlarmsData();
          this.deviceTypes = this.utilityService.countOccurrence(this.graphData.nodes, "type").map((m: any) => ({isSelected: false, name: m.type}));
          // To not update filter based on serach use next lines
          // this.deviceTypes = this.deviceTypes && this.deviceTypes.length > 0? this.deviceTypes: this.utilityService.countOccurrence(this.graphData.nodes, "type").map((m: any) => ({isSelected: false, name: m.type}));
          !deviceName && !siteName && this.updateTabWithGraphData();
          this.deviceNames = [];
          this.resetGraph();
        }, err => {
            console.error("Error occurred while fetching the Graph Data: ", err);
        });
    }

    updateTabWithGraphData() {
      this.resetGraph();
      let tabname = this.deviceName + "( " + this.viewName + " - " + this.siteName + " )";
      this.tabService.tabs.forEach(item => {if(item.tabDisplayName == tabname) item.tabGraphData = this.graphData} );
      this.tabService.updateTabs(this.tabService.tabs);
    }

    getAlarmsData() {
        let nodes = [];
        for (let eachNode of this.graphData.nodes) {
            nodes.push(eachNode.name);

        }
        let url = "alarm/api/view";
        this.exposureService.getAlarmData({"nodes": nodes}).subscribe((res: any) => {
            this.alarms = res.deviceData || [];
            this.alarmsOptions = res.deviceData || [];
            this.insights.alarmCount = res.alarmCount || 0;
            this.insights.deviceCount = res.deviceCount || 0;
            this.insights.alarmDeviceCount = res.alarmDeviceCount || 0;
        }, err => {
            console.error("Error occurred while fetching the Alarms Data: ", err);
        })

        this.alarmsTableColumns = [
            {
                displayName: "Element Name",
                varname: "entityname"
            },
            {
                displayName: "Class Name",
                varname: "entitytype"
            },
            {
                displayName: "Status/Severity",
                varname: "severity"
            },
            // {
            //     displayName: "Instance Name",
            //     varname: "instance"
            // },
            // {
            //     displayName: "Site Name",
            //     varname: "site"
            // },
            // {
            //     displayName: "User Defined 18",
            //     varname: "user_defined_18"
            // },
            // {
            //     displayName: "User Defined 19",
            //     varname: "user_defined_19"
            // },
            // {
            //     displayName: "Trouble Token Id",
            //     varname: "trouble_token_id"
            // },
            {
                displayName: "First Modified At",
                varname: "firstcreateddate"
            },
            {
                displayName: "Last Changed At",
                varname: "lastupdateddate"
            }
        ]

        this.entityTableColumns =[
            {
                displayName: "DOWN",
                varname: "devices"
            },
        ]

        this.serviceTableColumns =[
            {
                displayName: "WARNING",
                varname: "devices"
            },
            {
                displayName: "CRITICAL",
                varname: "devices"
            },
            {
                displayName: "NORMAL",
                varname: "devices"
            },
        ]
    }

    onDeviceTypeChange(type: any) {
        this.selectedDeviceType = type;
        this.selectedDeviceNames = "";
        this.deviceNames = this.graphData?.nodes?.filter((m: any) => m.type == type).map((m: any) => ({isSelected: false, name: m.name, type: type}));
    }

    onDeviceNameChange(selectedDevice: any) {
        this.selectedDeviceNames = this.graphData?.nodes?.find((m: any) => m.name == selectedDevice)?.name;
    }

    searchSelectedDevice() {
      this.getGraphData(this.selectedDeviceType, this.selectedDeviceNames);
    }
    resetGraph() {
      this.showGraph = false;
      setTimeout(() => {
         this.showGraph = true
       }, 100);
    }
    onGraphTypeChange() {
        // this.graphToLoad = event.target.value;
    }

    onGraphTypeChangeApply() {
        // let path = this.graphToLoad == "sankey_graph" ? "" : this.graphToLoad;
        // this.router.navigate([path]);
    }


    toggleGraphOptions() {
        // this.da.isFormattedJSONDataType = event.target.checked;
        this.toggleGraphSettings = !this.toggleGraphSettings;
        // this.dataTypesArray = this.dataServcie.getAllDataTypes();
    }

    expandSection(sectionName: string){
        if(sectionName == 'Topology'){
            if(this.expandTopologyBool){
                this.renderer.setStyle(this.alarmsWrapper.nativeElement, 'display', 'none');
                this.renderer.setStyle(this.graphsWrapper.nativeElement, 'width', '100%');
                this.renderer.setStyle(this.graphsWrapper.nativeElement, 'marginRight', '0px');
                this.expandTopologyBool = false;
            } else {
                this.renderer.setStyle(this.alarmsWrapper.nativeElement, 'display', 'block');
                this.renderer.setStyle(this.graphsWrapper.nativeElement, 'width', '65%');
                this.renderer.setStyle(this.graphsWrapper.nativeElement, 'marginRight', '20px');
                this.expandTopologyBool = true;
            }
        } else if(sectionName == 'Alarms'){
            if(this.expandAlarmsBool){
                this.renderer.setStyle(this.graphsWrapper.nativeElement, 'display', 'none');
                this.renderer.setStyle(this.alarmsWrapper.nativeElement, 'width', '100%');
                this.expandAlarmsBool = false;
            } else {
                this.renderer.setStyle(this.graphsWrapper.nativeElement, 'display', 'block');
                this.renderer.setStyle(this.alarmsWrapper.nativeElement, 'width', '35%');
                this.expandAlarmsBool = true;;
            }
        }  
    }
    
    PanGraph(direction: string) {
        if(this.graphToLoad == 'sankey_graph')
            this.sankeyGraph?.PanGraph(direction);
        else if(this.graphToLoad == 'radial-view')
            this.radialGraph?.PanGraph(direction);
    }

    ExpandGraph () {
        var doc: any = document;
        if (
              doc.fullscreenElement ||
              doc.webkitFullscreenElement ||
              doc.mozFullScreenElement ||
              doc.msFullscreenElement
            ) {
              if (doc.exitFullscreen) {
                doc.exitFullscreen();
              } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
              } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
              } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
              }
            } else {
              let element: any = document.getElementById("graphBody");
              let el: any = Element;
              if (element && element.requestFullscreen) {
                element.requestFullscreen();
              } else if (element && element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
              } else if (element && element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(el.ALLOW_KEYBOARD_INPUT);
              } else if (element && element.msRequestFullscreen) {
                element.msRequestFullscreen();
              }
            }
    }
    ZoomInGraph () {
        if(this.graphToLoad == 'sankey_graph')
            this.sankeyGraph?.ZoomInGraph();
        else if(this.graphToLoad == 'radial-view')
            this.radialGraph?.ZoomInGraph();
    }
    ZoomOutGraph () {
        if(this.graphToLoad == 'sankey_graph')
            this.sankeyGraph?.ZoomOutGraph();
        else if(this.graphToLoad == 'radial-view')
            this.radialGraph?.ZoomOutGraph();
    }
    ResetGraph () {
        // if(this.graphToLoad == 'sankey_graph')
        //     this.sankeyGraph?.ResetGraph();
        // else if(this.graphToLoad == 'radial-view')
        //     this.radialGraph?.ResetGraph();
    }
    isFullScreen() {
        var doc: any = document;
        return doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;
    }

  inventoryClick(){
    this.displayTabComp = 'inventory';
    let selectedNodeId = this.selectedNodeData?.node?.id;
    this.displayTabComp = 'node_'+selectedNodeId;
    let nodeTabName = this.selectedNodeData?.node?.name;

    let nodedDetails = this.graphData.nodes.find( (item: any) => item.id === selectedNodeId);
    let groupingView = nodedDetails?.groupingView;

    if(groupingView)
    {
        this.inventory = groupingView?.inventory;
        this.inventoryFlag = this.inventory?.flag;

        const checkNodeId = (obj:any) => (obj.id === selectedNodeId);
        if(!this.nodetabs.some(checkNodeId))
            this.nodetabs.push({id: selectedNodeId, name: "node_"+ selectedNodeId, tabName: nodeTabName});
    }

    setTimeout(()=>{
        document.getElementById('nodeInventoryBtn')?.classList.remove('node-options');
        document.getElementById('nodeInventoryBtn')?.classList.add('node-select');
        let inventoryTabElement = document.getElementById('nodeInventoryBtn');
        if(inventoryTabElement)
        inventoryTabElement.getElementsByTagName('img')[0].src = "assets/images/Inventory-select.svg";
        let invlabel = document.createElement('Label');
        invlabel.innerHTML = 'Inventory';
        invlabel.style.color = 'white';

        invlabel.classList.add("node-label");
        inventoryTabElement?.appendChild(invlabel);
    }, 0);
    
  }

    changeNodeOptions(option?: string){
    this.displayTabComp = 'native'
    }

    onSelectData(event:any){

        let selectedOption = event.target.value;
        if(selectedOption == ''){
            this.alarms = this.alarmsOptions;
        } else {
            let filterdData = this.alarmsOptions.filter(item => item.entityname === selectedOption);
            this.alarms = filterdData;
        }
    }

    onTopologyViewTabClick()
    {
      this.displayTabComp = 'native';
    }
  
    nodeTabClick(tab?: any) {
      //this.displayTabComp = 'inventory';
      let tabname = tab?.name;
      let id = tab?.id;

        for (var tab of this.nodetabs) {
            if (tabname === tab.name) {
                this.displayTabComp = tab.name;
            }
            else if(tab.name == 'Topology View') {
                this.displayTabComp = 'native';
            }
        }
    }

    isNodeTabVisible(tab: any){
        //console.log(eval(value));
        return this.displayTabComp == tab?.name; 
      }

}

