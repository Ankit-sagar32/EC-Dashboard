import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { D3Service } from '../../services/network-graph';

@Directive({
    selector: '[zoomableOf]'
})
export class ZoomableDirective implements OnInit {
    @Input('zoomableOf')
    zoomableOf!: any;

    constructor(private d3Service: D3Service, private _element: ElementRef) {}

    ngOnInit() {
        this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement);
    }

}
