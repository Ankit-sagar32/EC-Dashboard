import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { Node, ForceDirectedGraph } from '../../models/network-graph';
import { D3Service } from '../../services/network-graph';

@Directive({
    selector: '[draggableNode]'
})
export class DraggableDirective implements OnInit {
    @Input('draggableNode') draggableNode: Node | undefined;
    @Input('draggableInGraph') draggableInGraph: ForceDirectedGraph | undefined;

    constructor(private d3Service: D3Service, private _element: ElementRef) { }

    ngOnInit() {
        this.d3Service.applyDraggableBehaviour(this._element.nativeElement, this.draggableNode, this.draggableInGraph);
    }
}
