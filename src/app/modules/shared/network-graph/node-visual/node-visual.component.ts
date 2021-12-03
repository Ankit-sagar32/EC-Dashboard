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
    let alarmstate = nod?.groupingView?.alarm?.severity;
    switch (alarmstate) {
      case 1:
        return "up";
      case 2:
        return "orange";
      case 3:
        return "yellow";
      case 4:
        return "down";
      case 5:
        return "down";
      default:
        return "normal";
    }
  }
  getNodeHoverInfo(node: any) {
    let title = "";
    if(node?.name)
      title += "Name: " + node?.name + "\n";
    if(node?.id)
      title += "Id: " + node?.id + "\n";
    if(node?.type)
      title += "Type: " + node?.type + "\n";

    return title;
  }

  highlightLinks(node: any, highlight: boolean){
    if(node?.id){
      let elements = document.getElementsByClassName(node.id);
      if(elements && elements.length>0){
        Array.prototype.forEach.call(document.getElementsByClassName(node.id + " link"), function(element) {
          element.style["stroke-width"] = highlight?"0.5px":"0.25";
          element.style.stroke = highlight?"#5414B4":"grey";
      });
      }
    }
  }

  onmouseover(event: any, nod:any) {
    var circlesvg = document.getElementById("circle_"+ nod?.id);
    if(circlesvg){
      circlesvg.setAttribute('r', '9');
    }
    // event?.target.setAttribute('r', '9');
    var nodeimg = document.getElementById("nodeimg_"+ nod?.id);
    if(nodeimg)
    {
      nodeimg.style.height = "7px";
      nodeimg.style.width = "7px";
      nodeimg.style.transform = "translate(-3.5px, -3.5px)";
    }
  }
  onmouseleave(event: any, nod:any) {
    var circlesvg = document.getElementById("circle_"+ nod?.id);
    if(circlesvg){
      circlesvg.setAttribute('r', '6');
    }
    // event?.target.setAttribute('r', '6');
    var nodeimg = document.getElementById("nodeimg_"+ nod?.id);
    if(nodeimg)
    {
      nodeimg.style.height = "6px";
      nodeimg.style.width = "6px";
      nodeimg.style.transform = "translate(-3px, -3px)";
    }
  }
}
