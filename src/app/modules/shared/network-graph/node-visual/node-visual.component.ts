import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../../helpers/services/network-graph/data.service';
import { Node } from '../../../../helpers/services/network-graph';

@Component({
  selector: '[nodeVisual]',
  templateUrl: "./node-visual.component.html",
  styleUrls: ['./node-visual.component.scss']
})
export class NodeVisualComponent implements OnInit{
  @Input('nodeVisual') node: Node | undefined;
  nodeType:string = "";
  nodeSVG: any;

  constructor(){
    console.log("node: ", this.node);
    
  }

  ngOnInit(){
    if(this.node){
      this.nodeType = this.node.type.toLowerCase();
    }
  }

  getImg(nod:any){
    let img = "./assets/images/" + nod.type + ".svg";    
    return img;
  }
  getState(nod:any){
    switch (nod?.name?.substr(nod?.name.length - 1)) {
      default:
        return "normal";
    }
  }
}
