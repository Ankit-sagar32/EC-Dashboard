import { Component, Input, ChangeDetectorRef, HostListener, ChangeDetectionStrategy, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';
import { UtilityService } from 'src/app/helpers/services';
import { ExposureService } from 'src/app/helpers/services/exposure.service';
import { DataService } from 'src/app/helpers/services/network-graph/data.service';
import { D3Service, ForceDirectedGraph, Node } from '../../../../helpers/services/network-graph';

@Component({
  selector: 'app-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg #graphTag id="radial-wrapper"[attr.width]="_options.width"  [attr.height]="_options.height" style="transform: scale(3)" (mousedown)="onBackGroundClick()">
      <g id="radial-graph">
        <g [linkVisual]="link" *ngFor="let link of links"></g>
        <g class="btn" [nodeVisual]="node" *ngFor="let node of nodes"
            [draggableNode]="node" [draggableInGraph]="graph" (click)="click(node, $event)"></g>
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
  @Input('inputdata') inputdata: any;
  @ViewChild('graphTag') graphs!:ElementRef;
  ip: any;
  deviceName: any;
  deviceType: any;
  dc:any;
  clickCount=0;
  graph: any;// ForceDirectedGraph | undefined;
  // @Output() secondLevelGraphData = new EventEmitter<any>();
  secondLevelGraphData: any;
  svg:ElementRef|undefined;
  _options: { width:any, height:any } = { width: 800, height: 600 };

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

    this.applyZoomableBehaviour("#radial-wrapper", "#radial-graph");
  }

  ngAfterViewInit() {
    this.graph?.initSimulation(this.options);
  }

  get options() {
    return this._options;
  }

  onBackGroundClick(){
    this.dataSvc.emitChildEvent({
      searched: false
    });
  }

  zoom: any;
  applyZoomableBehaviour(svgElement:any, containerElement:any) {
    let svg, container:any, zoomed;
    
    svg = d3.select(svgElement);
    container = d3.select(containerElement);

    zoomed = () => {
      const transform = d3.event.transform;
      container.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')');
      container.attr('width', '100%');
      container.attr('height', '100%');
    }

    this.zoom = d3.zoom().on('zoom', zoomed);
    svg.call(this.zoom);
  }

  click(selectedNode?: any, event?:any) {
    this.clickCount++;
    setTimeout(() => {
        if (this.clickCount === 1) {
             this.onSingleClickNode(selectedNode,event)
        } else if (this.clickCount === 2) {
            this.onDoubleClickNode(selectedNode);
        }
        this.clickCount = 0;
    }, 250);
}

  onSingleClickNode(selectedNode?: any, event?:any){ 
    this.dataSvc.emitChildEvent({
      searched: false,
      node: selectedNode,
      posX: event.pageX + 5,
      posY: event.pageY - 22
    });
  }

  onDoubleClickNode(selectedNode?:any){
    let inputdataReceived = this.inputdata;
    if(!inputdataReceived.ise2eSelected) {
      this.dataSvc.emitChildEvent({
        searched: true,
        node: selectedNode,
        ise2eSelected : false,
        deviceName: inputdataReceived.deviceName,
        siteName: inputdataReceived.siteName,
        sourceId: inputdataReceived.sourceId,
        destinationId: inputdataReceived.destinationId,
        dataCenter: inputdataReceived.dataCenter
      });
    }
    else {
      this.dataSvc.emitChildEvent({
        searched: true,
        node: selectedNode,
        ise2eSelected : true,
        deviceName: inputdataReceived.deviceName,
        siteName: inputdataReceived.siteName,
        sourceId: inputdataReceived.sourceId,
        destinationId: inputdataReceived.destinationId,
        dataCenter: inputdataReceived.dataCenter
      });
    }
  }
  
  PanGraph(direction: string) {
    switch (direction) {
      case "UP":
        d3.select('#radial-wrapper')
          .transition()
          .call(this.zoom.translateBy, 0, -25);
        break;
      case "DOWN":
        d3.select('#radial-wrapper')
          .transition()
          .call(this.zoom.translateBy, 0, 25);
        break;
      case "LEFT":
        d3.select('#radial-wrapper')
        .transition()
        .call(this.zoom.translateBy, -25, 0);
          break;
      case "RIGHT":
          d3.select('#radial-wrapper')
          .transition()
          .call(this.zoom.translateBy, 25, 0);
        break;
      default:
        break;
    }
  }

  ZoomInGraph() {
    d3.select('#radial-wrapper')
		.transition()
		.call(this.zoom.scaleBy, 2);
  }
  ZoomOutGraph() {
    d3.select('#radial-wrapper')
		.transition()
		.call(this.zoom.scaleBy, 0.5);
  }
}
