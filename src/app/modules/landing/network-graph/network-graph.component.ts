import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Link, Node } from "../../../helpers/models/network-graph";
import { DataService } from "../../../helpers/services/network-graph/data.service";
import { delay } from "rxjs/operators";
import { UtilityService } from "src/app/helpers/services";
// import { threadId } from "worker_threads";
import { ExposureService } from "src/app/helpers/services/exposure.service";
import { ActivatedRoute } from "@angular/router";

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
    deviceName: string = "";
    constructor(
        private dataServcie: DataService, 
        private utilityService : UtilityService,
        private route: ActivatedRoute,
        ) {
        // this.legends = dataServcie.getAllLegends();
        // console.log("historn  ",history.state["data"]);
    }
    
    ngOnInit() { 
        console.log("Graph Data", this.graphData);
        this.legends = [];
        const transformedData : any = this.transformData(this.graphData);
        this.convertDataToGraphData(transformedData);
        this.buildLegends(transformedData['nodes']);
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if(!changes.graphData.firstChange && changes.graphData) {
            const transformedData : any = this.transformData(changes.graphData.currentValue);
            this.convertDataToGraphData(transformedData);
            this.buildLegends(transformedData['nodes']);
        }
    }

    buildLegends(nodes:any[]){
        let legends : any[] = [];
        if(nodes.length > 0){
            nodes.map(node => {
                legends.push({
                    name: node.type,
                    image: 'assets/images/'+ node.type+".svg"
                })
            });
        }
        this.legends = this.utilityService.countOccurrence(legends, "name");
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
                properties: eachNode.properties
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

        transformingData["nodes"] = filterdNodes;

        return transformingData;
    }
}