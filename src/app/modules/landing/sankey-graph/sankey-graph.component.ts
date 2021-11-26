import { Component, OnInit, OnDestroy, NgZone, Input, Inject } from '@angular/core';

import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';

import { colorCodesNodes, colorCodesNodesArray } from "./sankey-graph-colors";
import { UserFlow } from 'src/app/helpers/models/network-graph/user-flow';
import { DataService } from 'src/app/helpers/services/network-graph/data.service';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from 'src/app/helpers/services';

const DROPOUT_NODE_NAME = 'dropout';

declare global {
  interface Window { ue : any}
}

@Component({
  selector: 'app-sankey-graph',
  templateUrl: './sankey-graph.component.html',
  styleUrls: ['./sankey-graph.component.scss']
})
export class SankeyComponent implements OnInit, OnDestroy {

  // user flow
  userFlowData: UserFlow;
  isUfCollapsed = false;
  isFetchingUserFlowData = false;
  window:Window | null = null;
  colorCodes:any = [];
  legends: any[] = [];
  @Input() graphData:any;

  constructor(
    private ngZone: NgZone,
    private dataServcice: DataService,
    private utilityService : UtilityService,
    private dataSvc: DataService,
    @Inject(DOCUMENT) private document : Document
  ) {
    this.userFlowData = new UserFlow();
    this.window = document.defaultView;

    // creating window functions to interact with external js functions i.e. sankey chart
    try{
      if(this.window){
        this.window['ue'] = this.window['ue'] || {};
        this.window['ue']['userFlow'] = this.window['ue']['userFlow'] || {};
        this.window['ue']['userFlow'].publicFunc = this.publicFunc.bind(this);
      }
    }catch(e){
      console.error("Error occuered: ", e);
    }
  }

  ngOnInit(): void {
    this.loadData(this.graphData);
    this.buildLegends(this.graphData.nodes);
    this.dataSvc.legendListner().subscribe(legend => {
      this.filterGraphDataByLegend(legend);
    });
  }

  /* This will call API and load data */
  loadData(graphData: any): void {
    let updatedGraphData = this.adjustGraphNodesAndLinks(graphData);
    let transformedData = this.transformData(updatedGraphData);
    this.userFlowData.nodes = transformedData.nodes;
    this.userFlowData.links = transformedData.links;
    if (this.userFlowData.nodes.length) {
      this.drawChart(this.userFlowData);
    }
    this.isFetchingUserFlowData = false;

  }
  
  buildLegends(nodes:any[]){
    this.legends = [];
    if(nodes.length > 0){
        nodes.map(node => {
            this.legends.push({
                name: node.type,
                color: this.selectColorCode(node.type),
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
              nodeStatus[node?.name] = legend[i].selected;
              return;
          }
      }
      nodeStatus[node?.name] = false;
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
  sankeyLinkPath(link:any) {
    // this is a drop in replacement for d3.sankeyLinkHorizontal()
    // well, without the accessors/options
    let offset = 10;
    let sx = link.source.x1 - 1
    let tx = link.target.x0 + 1
    let sy0 = link.y0;
    let sy1 = link.y0;
    let ty0 = link.y1;
    let ty1 = link.y1;
    
    let halfx = (tx - sx)/2
  
    let path = d3.path()  
    path.moveTo(sx, sy0)
  
    let cpx1 = sx + halfx
    let cpy1 = sy0 + offset
    let cpx2 = sx + halfx
    let cpy2 = ty0 - offset
    path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0)
    path.lineTo(tx, ty1)
  
    cpx1 = sx + halfx
    cpy1 = ty1 - offset
    cpx2 = sx + halfx
    cpy2 = sy1 + offset
    path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1)
    path.lineTo(sx, sy0)
    return path.toString()
  }


  transformData(data: any): any {
    let transformingData :any = {};
    transformingData["nodes"] = [];
    let nodes = [];
    let links = [];

    if (this.dataServcice.isFormattedJSONDataType) {
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
        name: this.dataServcice.isFormattedJSONDataType ? eachNode.name || this.dataServcice.getNodeDetails(eachNode, "deviceName") : eachNode.labels[0],
        id: parseInt(eachNode.id),
        type: this.dataServcice.isFormattedJSONDataType ? eachNode.type || this.dataServcice.getNodeDetails(eachNode, "nodeType") : eachNode.labels[0],
      }
      transformingData["nodes"][obj.id] = obj;
    });

    // Add dummy records if dones have nodes 
    for (let i = 0; i < transformingData['nodes'].length; i++) {
      let curreObj = transformingData['nodes'][i];
      if (curreObj == undefined || curreObj == null) {
        transformingData['nodes'][i] = { name: "", id: i, type: "" };
      }
    }

    transformingData["links"] = [];
    links.forEach((eachLink:any) => {
      let linkObj = {
        source: this.dataServcice.isFormattedJSONDataType ? eachLink.source : parseInt(eachLink.start.id),
        target: this.dataServcice.isFormattedJSONDataType ? eachLink.target : parseInt(eachLink.end.id),
        value: this.dataServcice.isFormattedJSONDataType && eachLink.value !== '' ? eachLink.value : 5
      };
      transformingData["links"].push(linkObj);
    });
    return transformingData;
  }

  categorizeNode(chartData: UserFlow): any {
    let categorizedNode :any = {};
    categorizedNode['nodes'] = {};
    chartData.nodes.forEach(eachNode => {
      const label = eachNode.name;
      categorizedNode['nodes'][label] = categorizedNode['nodes'][label] || [];
      categorizedNode['nodes'][label].push(eachNode);
    });

    categorizedNode['links'] = {};
    chartData.links.forEach(eachLink => {
      const relationLink = eachLink.source.name + "_" + eachLink.source.id + "-" + eachLink.target.name + "_" + eachLink.target.id;

      categorizedNode['links'][relationLink] = categorizedNode['links'][relationLink] || [];
      categorizedNode['links'][relationLink].push(eachLink);
    });

    return categorizedNode;

  }

  selectColorCode(nodeName:any): string {
    if(this.colorCodes[nodeName]) return this.colorCodes[nodeName];
    let color = colorCodesNodesArray[Math.round(Math.random() * 10)];
    this.colorCodes[nodeName] = color;
    return color;
  }

  getGradID(d: any) {
    return "linkGrad-" + d.source.name + "-" + d.target.name;
}
  adjustGraphNodesAndLinks(data:any){
    let adjustedGraphData:any = {
      nodes: [],
      links: []
    }
    data.nodes.map((node:any, index:any) => {
      adjustedGraphData.nodes.push({
        ...node,
        idGiven: node.id,
        id: index
      })
    })
    data.links.map((link:any) => {
      adjustedGraphData.links.push({
        ...link,
        source: this.getLinkSource(link, adjustedGraphData.nodes, "source"),
        target: this.getLinkSource(link, adjustedGraphData.nodes, "target")
      })
    })
    return adjustedGraphData;
  }

  getLinkSource(link:any, nodes:any, reqParam:any){
    let reqNode = nodes.filter((node:any) => node.idGiven === link[reqParam])[0];
    return reqNode.id || 0;
  }

  positionGrads(grads: any) {
    grads.attr("x1", function(d: any){return d.source.x;})
        .attr("y1", function(d: any){return d.source.y;})
        .attr("x2", function(d: any){return d.target.x;})
        .attr("y2", function(d: any){return d.target.y;});
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

  drawChart(chartData: UserFlow): void {
    // creating a temporary sankey plot to identify the interactions for height and width calculation of viewport
    const sankeyTemp = d3Sankey.sankey()
      .nodeWidth(15)
      .nodePadding(20)
      .nodeAlign(d3Sankey.sankeyLeft)
      .extent([[1, 1], [100, 100]]);
    sankeyTemp(chartData);
    const iterTemp = d3.nest()
      .key((d: any) => d.x0)
      .sortKeys(d3.ascending)
      .entries(chartData.nodes)
      .sort((a: any, b: any) => a.key - b.key);


    const interactions = iterTemp.length;
    const height = chartData.nodes.length * 30;
    const width = interactions * 350;

    // plotting the sankey chart
    const sankey = d3Sankey.sankey()
      .nodeWidth(15)
      .nodePadding(20)
      .nodeAlign(d3Sankey.sankeyLeft)
      .extent([[1, 1], [width, height]]);

    sankey(chartData);

    const iter = d3.nest()
      .key((d: any) => d.x0)
      .sortKeys(d3.ascending)
      .entries(chartData.nodes)
      .map((d: any) => d.key)
      .sort((a: any, b: any) => a - b);

    const formatNumber = d3.format(',.0f');
    const format = (d: any): string => formatNumber(d) + ' session(s)';
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // reset data
    d3.selectAll('#sankey > *').remove();

    // add svg for graph
    const svg = d3.select('#sankey').append('svg')
      .attr('width', width + 100 + "px")
      .attr('height', height + "px")
      .attr('viewbox', `0 0 ${width+ "px"} ${height+ "px"}`)
      .style("overflow", "overlay");

    let categorizedNodes = this.categorizeNode(chartData);
    
    // adding linearGradient defs

    var defs = svg.append("defs");

    var grads = defs.selectAll("linearGradient")
        .data(Object.keys(categorizedNodes.links).map(m=> categorizedNodes.links[m][0]), this.getGradID);

    this.addGradientByNodeId(grads);

    // add in the links (excluding the dropouts, coz it will become node)
    for (let eachLinkKey in categorizedNodes.links) {
      let subLinks = categorizedNodes.links[eachLinkKey];
      subLinks[0].value = subLinks.length;
      let link = svg.append('g')
        .attr('class', 'link')
        .selectAll('.link')
        .data(subLinks)
        .enter()
        .append('path')
        .attr('class', (d: any) => d.source.name + " " + d.target.name)
        .attr('d', (d) => this.sankeyLinkPath(d))
        .attr('fill', (d) => { return "url(#" + this.getGradID(d) + ")";})
        .attr('stroke', (d) => { return "url(#" + this.getGradID(d) + ")";})
        .style('opacity', '0.5')
        //.style("stroke-opacity", "0.5")
        .on("mouseover", function() { d3.select(this).style("opacity", "0.9") } )
        .on("mouseout", function() { d3.select(this).style("opacity", "0.5") } )
        // .style("stroke-width", function (d) {
        //     return Math.max(1, d.dy);
        // })
        .attr('stroke-width', (d: any) => Math.max(1, d.width))
        .sort((a: any, b: any) => {
          if (a.target.name.toLowerCase() === DROPOUT_NODE_NAME) {
            return -1;
          } else if (b.target.name.toLowerCase() === DROPOUT_NODE_NAME) {
            return 1;
          } else {
            return 0;
          }
        });

      // add the link titles
      link.append('title')
        .text((d: any) => d.source.name + ' → ' +
          d.target.name + '\n' + format(d.value));

    }


    for (let eachNodeKey in categorizedNodes.nodes) {

      if (eachNodeKey && eachNodeKey !== "") {
        let subNodes = categorizedNodes.nodes[eachNodeKey];
        // plotting the nodes
        let eachNodeChart = svg.append('g')
          .attr('class', 'node')
          .selectAll('.node')
          .data(subNodes)
          .enter().append('g')
          .attr('id', (d: any) => d.name + "_" + d.id)
          .attr('class', (d: any) => d.name)
          .style('cursor', 'pointer')
          .on('mouseover', this.fade(chartData, svg, 1))
          .on('mouseout', this.fade(chartData, svg, 0.7))
          .on('click', (d: any) => {
            this.fnOnNodeClicked(d);
            const el = document.getElementById(d.name + "_" + d.id);
            const {top, left} = this.getCoords(el);
            this.dataSvc.emitChildEvent({
              searched: false,
              node: d,
              posX: left + 8,
              posY: top - 18
            });
          });

        eachNodeChart.append('rect')
          .attr('x', (d: any) => d.x0)
          .attr('y', (d: any) => d.y0)
          .attr('height', (d: any) => d.y1 - d.y0)
          .attr('width', (d: any) => d.x1 - d.x0)
          .attr('fill', () => this.selectColorCode(subNodes[0].type))
          //.attr('stroke', '#142208')
          .append('title')
          .text((d: any) => d.name + "_" + d.id + '\n' + format(d.value));

        eachNodeChart.append('text')
          .attr('x', (d: any) => d.x1 + 20)
          .attr('y', (d: any) => (d.y1 + d.y0) / 2)
          .attr('dy', '0.35em')
          .attr('font-size', "12px")
          .attr('font-family', 'Roboto')
          .attr('text-anchor', 'end')
          .text((d: any) => this.truncateText(d.name + "_" + d.id, 20))
          .attr('text-anchor', 'start')
          .append('title')
          .text((d: any) => d.name + "_" + d.id);
      }

    }
    this.applyZoomableBehaviour("#sankey-wrapper", "#sankey");
  }

  addGradientByNodeId(grads: any) {
    var g = grads.enter().append("linearGradient")
      .attr("id", this.getGradID)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d: any) => { return d.source.x1; })
      .attr("x2", (d: any) => { return d.target.x0; });

    g.html("") //erase any existing <stop> elements on update
      .append("stop")
      .attr("offset", "20%")
      .attr("stop-color", (d: any) => {
        return this.selectColorCode(d.source.type);
      });

    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", (d: any) => {
        return this.selectColorCode(d.target.type);
      });
  }

  /* miscellaneous functions */

  // function to fade other links on hove of a node
  fade(chartData:any, svg:any, opacity: any): any {
    return (g:any, i:any) => {

      svg.selectAll('.link')
        .filter((d: any) => d?.source.node !== chartData.nodes[i].node && d?.target.node !== chartData.nodes[i].node)
        .transition()
        .style('opacity', opacity);
    };
  }

  // function to format the interaction number
  formatInteraction(num: number): string {
    const lastDigit = num % 10;
    switch (lastDigit) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  }

  // function gets called on click of a dropout node
  fnOnDropOutLinkClicked(dropOutLink: any): void {
    if(this.window){
      this.window['ue']['userFlow'].publicFunc(dropOutLink.target, true);
    }
  }

  onBackGroundClick(){
    this.dataSvc.emitChildEvent({
      searched: false
    });
  }
  
  // function gets called on click of a node
  fnOnNodeClicked(clickedNode: any): void {
    if(this.window){
      this.window['ue']['userFlow'].publicFunc(clickedNode);
    }
  }

  // common util function to truncate text
  truncateText(value: any, limit: number): string {
    return value ? (value.length > limit) ? String(value).substr(0, limit - 1) + '...' : value : '';
  }

  // window function that's called from D3 and internally calls angular function
  publicFunc(node: any, isDropout = false): void {
    this.ngZone.run(() => this.nodeClicked(node, isDropout));
  }

  nodeClicked(node: any, isDropout: boolean): void {
    if (isDropout) {
      console.log('dropout node clicked', node);
    } else {
      console.log('node clicked', node);
    }
  }
  getCoords(elem: any) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

  PanGraph(direction: string) {
    switch (direction) {
      case "UP":
        d3.select('#sankey-wrapper')
          .transition()
          .call(this.zoom.translateBy, 0, -50);
        break;
      case "DOWN":
        d3.select('#sankey-wrapper')
          .transition()
          .call(this.zoom.translateBy, 0, 50);
        break;
      case "LEFT":
        d3.select('#sankey-wrapper')
        .transition()
        .call(this.zoom.translateBy, 50, 0);
          break;
      case "RIGHT":
          d3.select('#sankey-wrapper')
          .transition()
          .call(this.zoom.translateBy, -50, 0);
        break;
      default:
        break;
    }
  }

  ZoomInGraph() {
    d3.select('#sankey-wrapper')
		.transition()
		.call(this.zoom.scaleBy, 2);
  }
  ZoomOutGraph() {
    d3.select('#sankey-wrapper')
		.transition()
		.call(this.zoom.scaleBy, 0.5);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    // this.unsubscribeAll.next();
    // this.unsubscribeAll.complete();
    if(this.window){
      this.window['ue']['userFlow'].publicFunc = null;
    }
  }

}
