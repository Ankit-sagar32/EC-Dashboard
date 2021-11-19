import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { Node } from './node';
import * as d3 from 'd3';

const FORCES = {
  LINKS: 1,
  COLLISION: 1,
  CHARGE: -1
}

export class ForceDirectedGraph {
  public ticker: EventEmitter<any> = new EventEmitter<any>();
  public simulation!: d3.Simulation<any, any>;
  iconwidth = 30;
  iconht = 30;
  linkdistance = 20;
  collidedistance = 20;
  chargedStrength = -400;
  xdenom = 0.5;
  ydenom = 0.5;
  xstrength = 0.2;
  ystrength = 0.2;

  public nodes: Node[] = [];
  public links: Link[] = [];

  constructor(nodes:Node[], links:Link[], options: { width:any, height:any }) {
    this.nodes = nodes;
    this.links = links;

    this.initSimulation(options);
  }

  connectNodes(source:any, target:any) {
    let link;

    if (!this.nodes[source] || !this.nodes[target]) {
      throw new Error('One of the nodes does not exist');
    }

    link = new Link(source, target);
    this.simulation.stop();
    this.links.push(link);
    this.simulation.alphaTarget(0.3).restart();

    this.initLinks();
  }

  initNodes() {
    if (!this.simulation) {
      throw new Error('simulation was not initialized yet');
    }

    this.simulation.nodes(this.nodes);
  }

  initLinks() {
    if (!this.simulation) {
      throw new Error('simulation was not initialized yet');
    }

    this.simulation.force('links',
      d3.forceLink(this.links)
        .id((d:any) => d['id'])
        .strength(FORCES.LINKS)
    );
  }

  initSimulation(options:any) {
    if (!options || !options.width || !options.height) {
      throw new Error('missing options when initializing simulation');
    }

    /** Creating the simulation */
    if (!this.simulation) {
      const ticker = this.ticker;

      this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d:any) => d['id']).distance(this.linkdistance))
      .force('charge', d3.forceManyBody().strength(this.chargedStrength))
      .force('center', d3.forceCenter(options.width/2, options.height/2))
      .force('forceX', d3.forceX(options.width / this.xdenom).strength(this.xstrength))
      .force('forceY', d3.forceY(options.height / this.ydenom).strength(this.ystrength))
      .force("collide", d3.forceCollide(this.collidedistance));
      // .force('charge',
      //     d3.forceManyBody()
      //       .strength((d:any) => FORCES.CHARGE * d['r'])
      //   )
      //   .force('collide',
      //     d3.forceCollide()
      //       .strength(this.collidedistance)
      //       .radius(5)
      //       .iterations(2)
      //   );

      // Connecting the d3 ticker to an angular event emitter
      this.simulation.on('tick', () => {
        ticker.emit(this);
      });

      this.initNodes();
      this.initLinks();
    }

    /** Updating the central force of the simulation */
    this.simulation.force('centers', d3.forceCenter(options.width / 2, options.height / 2));

    /** Restarting the simulation internal timer */
    // this.simulation.restart();
  }
}
