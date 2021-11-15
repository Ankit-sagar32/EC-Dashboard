import { Injectable, EventEmitter } from '@angular/core';
import { Node, Link, ForceDirectedGraph } from '../../models/network-graph';
import * as d3 from 'd3';

@Injectable({providedIn: 'root'})
export class D3Service {
  /** This service will provide methods to enable user interaction with elements
    * while maintaining the d3 simulations physics
    */
  constructor() { }

  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement:any, containerElement:any) {
    let svg, container:any, zoomed, zoom;

    svg = d3.select(svgElement);
    container = d3.select(containerElement);

    zoomed = () => {
      const transform = d3.event.transform;
      container.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')');
      container.attr('width', '100%');
      container.attr('height', '100%');
    }

    zoom = d3.zoom().on('zoom', zoomed);
    svg.call(zoom);
  }

  /** A method to bind a draggable behaviour to an svg element */
  applyDraggableBehaviour(element:any, node: any, graph: any) {
    const d3element = d3.select(element);

    function started() {
      /** Preventing propagation of dragstart to parent elements */
      d3.event.sourceEvent.stopPropagation();

      if (!d3.event.active) {
        graph.simulation.alphaTarget(0.3).restart();
      }

      d3.event.on('drag', () => {
        console.log("drag started!");
        node.fx = d3.event.x;
        node.fy = d3.event.y;
      }).on('end', () => {
        console.log("drag ended!");
        if (!d3.event.active) {
          graph.simulation.alphaTarget(0);
        }
        node.fx = d3.event.x;
        node.fy = d3.event.y;
        // node.fx = null;
        // node.fy = null;
      });
    }

    d3element.call(d3.drag()
      .on('start', started));
  }

  /** The interactable graph we will simulate in this article
  * This method does not interact with the document, purely physical calculations with d3
  */
  getForceDirectedGraph(nodes: Node[], links: Link[], options: { width:any, height:any }) {
    const sg = new ForceDirectedGraph(nodes, links, options);
    return sg;
  }
}
