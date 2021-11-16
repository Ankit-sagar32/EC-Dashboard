import { Component, Input, ChangeDetectorRef, HostListener, ChangeDetectionStrategy, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/app/helpers/services';
import { ExposureService } from 'src/app/helpers/services/exposure.service';
import { DataService } from 'src/app/helpers/services/network-graph/data.service';
import { D3Service, ForceDirectedGraph, Node } from '../../../../helpers/services/network-graph';

@Component({
  selector: 'app-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #nodeInfo id="box" *ngIf="ifClicked">
    <h6 class="node-properties" style="margin-top: 4px;"> Name: {{ deviceName }}</h6>
    <h6 class="node-properties"> Type: {{ deviceType }}</h6>
    <h6 class="node-properties"> IP: {{ ip }}</h6>
    <h6 class="node-properties"> DC: {{ dc }}</h6>
    <h6 class="node-properties" style="border-bottom: 1px solid lightgrey"> Severity:  </h6>
    <img (click)="inventoryClick()" src="assets/images/Inventory.svg" style="margin-left: 15px; margin-top: 5px; margin-right: 5px;" />
    <img  src="assets/images/Alarm.svg" style="margin-top: 5px; margin-right: 5px;"/> 
    <img  src="assets/images/Graph.svg" style="margin-top: 5px; margin-right: 5px;"/> 
    <img  src="assets/images/Traffic.svg" style="margin-top: 5px"/> 
    </div>
    <svg #graphTag [attr.width]="_options.width"  [attr.height]="_options.height" style="transform: scale(3)">
      <g [zoomableOf]="graphTag" >
        <g [linkVisual]="link" *ngFor="let link of links"></g>
        <g class="btn" [nodeVisual]="node" *ngFor="let node of nodes"
            [draggableNode]="node" [draggableInGraph]="graph" (click)="click(node, $event)"  (blur)="onBackGroundClick()" (dblclick)="onDoubleClickNode(node)"></g>
            <g>      
        </g>
      </g>
    </svg>
  `,
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit {
  @Input('nodes') nodes : any;
  @Input('links') links : any;
  @ViewChild('graphTag') graphs!:ElementRef;
  ip: any;
  deviceName: any;
  deviceType: any;
  dc:any;
  ifClicked: boolean = false;
  clickCount=0;
  graph: ForceDirectedGraph | undefined;
  // @Output() secondLevelGraphData = new EventEmitter<any>();
  secondLevelGraphData: any;
  svg:ElementRef|undefined;
  _options: { width:any, height:any } = { width: 800, height: 600 };

  @ViewChild('nodeInfo') nodeInfo!: ElementRef ;

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.graph?.initSimulation(this.options);
  }

  constructor(
    private d3Service: D3Service, 
    private ref: ChangeDetectorRef,
    private utilityService : UtilityService,
    private exposureService: ExposureService,
    private renderer: Renderer2,
    private dataSvc: DataService
    ) {}

  ngOnInit() {
    /** Receiving an initialized simulated graph from our custom d3 service */
    this.graph = this.d3Service.getForceDirectedGraph(this.nodes, this.links, this.options);

    /** Binding change detection check on each tick
     * This along with an onPush change detection strategy should enforce checking only when relevant!
     * This improves scripting computation duration in a couple of tests I've made, consistently.
     * Also, it makes sense to avoid unnecessary checks when we are dealing only with simulations data binding.
     */
    this.graph.ticker.subscribe((d:any) => {
      this.ref.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.graph?.initSimulation(this.options);
  }

  get options() {
    return this._options;
  }

  onBackGroundClick(){
    this.ifClicked = false;
  }

  click(selectedNode?: any, event?:any) {
    this.clickCount++;
    setTimeout(() => {
        if (this.clickCount === 1) {
             // single
             this.onSingleClickNode(selectedNode,event)
        } else if (this.clickCount === 2) {
            // double
            this.onDoubleClickNode();
        }
        this.clickCount = 0;
    }, 250)
}

  onSingleClickNode(selectedNode?: any, event?:any){ 
    this.ifClicked = true;

    console.log("selectedNodeData:", selectedNode);
    console.log("selectedNodeDataX:", selectedNode.fx);
    console.log("selectedNodeDataY:", selectedNode.fy);
    
    this.ip = selectedNode?.properties[2].value;
    this.deviceType = selectedNode?.properties[4].value; 
    this.deviceName = selectedNode?.properties[5].value;
    this.dc = selectedNode?.properties[6].value;

    this.renderer.setStyle(this.nodeInfo.nativeElement, 'top', `${event.pageX}px`);
    this.renderer.setStyle(this.nodeInfo.nativeElement, 'left', `${event.pageY}px`);
    // let offsetLeft: any;
    // let offsetTop: any;
    // let el = event.srcElement;
    // console.log("el:", el)
    // console.log("offsetLeft", offsetLeft);
    // console.log("offsetTop", offsetTop);
    // return { offsetTop:event.offsetX , offsetLeft:event.offsetLeft }
  }

  onDoubleClickNode(selectedNode?:any){
    this.ifClicked = false;
    this.deviceType = selectedNode?.properties[4].value; 
    this.deviceName = selectedNode?.properties[5].value;
    this.exposureService.getGraphData(this.deviceType, this.deviceName).subscribe((response: any) => {
       this.secondLevelGraphData = response; 
       this.dataSvc.emitChildEvent(this.secondLevelGraphData);
    });
    this.dataSvc.emitChildEvent(selectedNode);
  }

  inventoryClick(){
    console.log("in Inventory code.")
  }
}
