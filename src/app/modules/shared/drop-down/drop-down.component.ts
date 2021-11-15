import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from "@angular/core";

@Component({
    selector: "app-drop-down",
    templateUrl: "./drop-down.component.html",
    styleUrls: ["./drop-down.component.scss"]
})
export class DropDown implements OnInit, OnChanges {
    @Input() dropDownList:any[] = [];
    @Input() placeHolderText: string = "";
    @Output() onChange = new EventEmitter();
    
    showDropdownOptions: boolean = false;
    selectedOption: string = "";
    
    constructor() {

    }

    ngOnInit() {
    }

    ngOnChanges(){
        if(this.dropDownList.length > 0){
            let selectedOption = this.dropDownList.filter(item => item.isSelected);
            if(selectedOption.length > 0){
                this.selectDropDownOption(selectedOption[0]);
            }else {
                this.selectedOption = "";
            }
        }
    }

    toggleDropDownOptionsVisibility() {
        this.showDropdownOptions = !this.showDropdownOptions;
    }

    onInputBlur(defaultTimeout = 1000) {
        setTimeout(() => {
            this.showDropdownOptions = false;
        }, defaultTimeout);
    }

    selectDropDownOption(option:any) {
        if(option.name != ""){
            this.dropDownList.map(item => item.isSelected = option == item.name);
            this.selectedOption = option.name;
            this.onChange.emit(option.name);
            this.onInputBlur(100);
        }
    }
}