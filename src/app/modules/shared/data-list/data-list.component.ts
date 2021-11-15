import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from "@angular/core";

@Component({
    selector: "app-data-list",
    templateUrl: "./data-list.component.html",
    styleUrls: ["./data-list.component.scss"]
})
export class DataList implements OnInit, OnChanges {

    @Input() dataList :any[] = [];
    @Input() placeHolderText: string = "Search Text here...";

    selectedValue: string = "";

    @Output() onChange = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    ngOnChanges() {
        let filterData = this.dataList.filter(item => item.isSelected);
        if(filterData.length > 0){
            let fakeEvent = {
                target: {
                    value : filterData[0].name
                }
            }
            this.onSelectData(fakeEvent)
        }else {
            this.selectedValue = "";
        }
    }

    onSelectData(event:any){
        let selectedOption = event.target.value;
        if(this.isValidOption(selectedOption)){
            this.selectedValue = selectedOption;
            this.onChange.emit(selectedOption);
        }else {
            this.selectedValue = "";
        }
    }

    isValidOption(option:any){
        let filterdData = this.dataList.filter(item => item.name === option);
        return filterdData.length > 0;
    }
}