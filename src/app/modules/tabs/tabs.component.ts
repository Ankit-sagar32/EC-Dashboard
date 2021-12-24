import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-tabs",
    templateUrl: "./tabs.component.html",
    styleUrls : ["./tabs.component.scss"]
})
export class TabsComponent implements OnInit {
    constructor() {}
    backgroundBlurBool: boolean = false;

    ngOnInit() {
        
    }

    blurShow(blur: any){
        this.backgroundBlurBool = blur;
    }
}
