import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { Link, Node } from "../../../helpers/models/network-graph";
import { DataService } from "../../../helpers/services/network-graph/data.service";
import { delay } from "rxjs/operators";
import { UtilityService } from "src/app/helpers/services";
// import { threadId } from "worker_threads";
import { ExposureService } from "src/app/helpers/services/exposure.service";
import { ActivatedRoute } from "@angular/router";
import { GraphComponent } from "../../shared/network-graph/graph/graph.component";

@Component({
    selector: "app-network-graph",
    templateUrl: "./network-graph.component.html",
    styleUrls: ["./network-graph.component.scss"]
})
export class NetworkGraph implements OnInit, OnChanges {
    nodes: Node[] = [];
    links: Link[] = [];
    isLoading: boolean = true;
    legends: any[] = [];
    newNodes: Node[] =[]
    newLinks: Link[] = [];
    deviceType: string = "";
    viewType: string= "";
    siteName: string = "";
    @Input() graphData:any;
    @Input() allinputs :any;
    deviceName: string = "";

    @ViewChild(GraphComponent ) radialGraph: GraphComponent | undefined ; 
    constructor(
        private dataServcie: DataService, 
        private utilityService : UtilityService,
        private route: ActivatedRoute,
        private dataSvc: DataService,
        ) {
    }
    
    ngOnInit() {
        this.loadData(this.graphData);
        this.buildLegends(this.graphData?.nodes);
        this.dataSvc.legendListner().subscribe(legend => {
            this.filterGraphDataByLegend(legend);
          });
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if( changes.graphData && !changes.graphData.firstChange) {
            this.loadData(changes.graphData.currentValue)
            this.buildLegends(this.graphData?.nodes);
        }
    }

    loadData(graphData: any) {
        const transformedData : any = this.transformData(graphData);
        this.convertDataToGraphData(transformedData);
    }

    buildLegends(nodes:any[]){
        this.legends = [];
        if(nodes.length > 0){
            nodes.map(node => {
                this.legends.push({
                    name: node.type,
                    image: 'assets/images/'+ node.type+"-01.svg",
                    selected: true
                })
            });
        }
        this.legends = this.utilityService.countOccurrence(this.legends, "name");
        this.dataSvc.emitLegendUpdate(this.legends);
    }

    filterGraphDataByLegend(legend: any[]) {
        //if(JSON.stringify(legend) == JSON.stringify(this.legends)) return;
        this.legends = legend;
        let filteredGraphData = {
            nodes : this.graphData.nodes.map((m:any) => m),
            links: this.graphData.links.map((m:any) => m),
            hrefs: this.graphData.hrefs.map((m:any) => m),
        };
        let nodeStatus: any = {};
        filteredGraphData.nodes?.forEach((node: any) => {
            for (var i = 0; i < legend.length; ++i) {
                if(legend[i].name == node?.type){ 
                    nodeStatus[node?.id] = legend[i].selected;
                    return;
                }
            }
            nodeStatus[node?.id] = false;
            return;
        });
        Object.keys(nodeStatus).forEach((key) => {
            Array.prototype.forEach.call(document.getElementsByClassName(key), function(element) {
                let status = true;
                for (var i = 0; i < element.classList.length; ++i) {
                    if(nodeStatus[element.classList[i]] === false) {
                        status = false;
                        break;
                    }
                }
                element.style.display = status?"inline":"none";
            });
         });
      }

    convertDataToGraphData(data:any) {
        this.nodes = [];
        this.links = [];
        data.nodes.forEach((node:any) => {
            if(!node.type){
                for(let i=0; i< node.properties.length; i++){
                    let property = node.properties[i];
                    if(property.name === "nodeType"){
                        node.type = property.value;
                    }
                    if(property.name === "image"){
                        node.imageUrl = property.value;
                    }
                }
            }
            const newNode  = new Node(node.id, node.name, node.type, node.imgUrl);
            newNode.properties = node.properties;
            newNode.groupingView = node.groupingView;
            this.nodes.push(newNode);
        })

        data.links.forEach((link:any) => {
            let from = link.source;
            let to = link.target;
            this.links.push(new Link(from, to));
        });

        this.newNodes = JSON.parse(JSON.stringify(this.nodes));
        this.newLinks = JSON.parse(JSON.stringify(this.links));
        
        this.isLoading = false;
    }

    transformData(data: any): any {
        let linkfrom:any = [];
        let linkto:any = [];
        let transformingData:any = {};
        transformingData["nodes"] = [];
        let nodes = [];
        let links = [];

        if (this.dataServcie.isFormattedJSONDataType) {
            nodes = data.nodes;
            links = data.links;
        } else {
            data.map((item:any) => {
                if (item.type == "node") {
                    nodes.push(item);
                } else if (item.type == "relationship") {
                    links.push(item);
                }
            });
        }

        nodes.forEach((eachNode:any) => {
            let obj = {
                name: this.dataServcie.isFormattedJSONDataType ? eachNode.name : eachNode.labels[0],
                id: parseInt(eachNode.id),
                type: this.dataServcie.isFormattedJSONDataType ? eachNode.type : eachNode.labels[0],
                properties: eachNode.properties,
                groupingView: eachNode.groupingView
            }
            transformingData["nodes"][obj.id] = obj;
        });

        // Add dummy records if dones have nodes 
        for (let i = 0; i < transformingData['nodes'].length; i++) {
            let curreObj = transformingData['nodes'][i];
            if (curreObj == undefined || curreObj == null) {
                transformingData['nodes'][i] = { name: "dummy", id: i };
            }
        }

        transformingData["links"] = [];
        links.forEach((eachLink:any) => {
            let linkObj = {
                source: this.dataServcie.isFormattedJSONDataType ? eachLink.source : parseInt(eachLink.start.id),
                target: this.dataServcie.isFormattedJSONDataType ? eachLink.target : parseInt(eachLink.end.id),
                value: this.dataServcie.isFormattedJSONDataType ? eachLink.value : 5
            };
            linkfrom.push(linkObj.source);
            linkto.push(linkObj.target);
            transformingData["links"].push(linkObj);
        });

        let filterdNodes = transformingData['nodes'].filter((nodeItem:any) => linkfrom.indexOf(nodeItem.id) >= 0 || linkto.indexOf(nodeItem.id) >= 0)

        if(filterdNodes.length < 1)
            transformingData["nodes"] = nodes;
        else
            transformingData["nodes"] = filterdNodes;

        return transformingData;
    }
    PanGraph(direction: string) {
        this.radialGraph?.PanGraph(direction);
    }

    ZoomInGraph () {
        this.radialGraph?.ZoomInGraph();
    }
    ZoomOutGraph () {
        this.radialGraph?.ZoomOutGraph();
    }

    ResetGraph() {
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
        }, 100);
      }
}