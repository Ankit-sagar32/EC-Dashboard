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
    <svg #graphTag id="radial-wrapper"[attr.width]="_options.width"  [attr.height]="_options.height" style="transform: scale(3)">
      <g id="radial-graph">
        <g [linkVisual]="link" *ngFor="let link of links"></g>
        <g class="btn" [nodeVisual]="node" *ngFor="let node of nodes"
            [draggableNode]="node" [draggableInGraph]="graph" (click)="click(node, $event)"  (blur)="onBackGroundClick(node)" (dblclick)="onDoubleClickNode(node)"></g>
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
  graph: any;// ForceDirectedGraph | undefined;
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

    this.applyZoomableBehaviour("#radial-wrapper", "#radial-graph");
  }

  ngAfterViewInit() {
    this.graph?.initSimulation(this.options);
  }

  get options() {
    return this._options;
  }

  onBackGroundClick(blurredNode?: any){
    this.ifClicked = false;
    blurredNode.blurNode = true;
    this.dataSvc.emitChildEvent(blurredNode);
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
             // single
             this.onSingleClickNode(selectedNode,event)
        } else if (this.clickCount === 2) {
            // double
            this.onDoubleClickNode(selectedNode);
        }
        this.clickCount = 0;
    }, 250);
}

  onSingleClickNode(selectedNode?: any, event?:any){ 
    this.ifClicked = true;
    selectedNode.doubleClicked = false;
    this.dataSvc.emitChildEvent(selectedNode);
    // console.log("selectedNodeData:", selectedNode);
    // console.log("selectedNodeDataX:", selectedNode.fx);
    // console.log("selectedNodeDataY:", selectedNode.fy);
    
    // this.ip = selectedNode?.properties[2].value;
    // this.deviceType = selectedNode?.properties[4].value; 
    // this.deviceName = selectedNode?.properties[5].value;
    // this.dc = selectedNode?.properties[6].value;
    // let _self = this;
    // let leftPosition = selectedNode.fx;
    // let topPosition = selectedNode.fy;
    // setTimeout(()=>{ 
    //   _self.renderer.setStyle(_self.nodeInfo.nativeElement, 'transform', `translate(${event.pageX}px, ${event.pageY}px)`);
    // }, 150);

    //this.renderer.setStyle(this.nodeInfo.nativeElement, 'top', `${event.pageX}px`);
    //this.renderer.setStyle(this.nodeInfo.nativeElement, 'left', `${event.pageY}px`);
    
  }

  onDoubleClickNode(selectedNode?:any){
    this.ifClicked = false;
    selectedNode.doubleClicked = true;
    this.dataSvc.emitChildEvent(selectedNode);
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
