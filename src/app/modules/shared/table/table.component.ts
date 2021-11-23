import { AfterContentInit, AfterViewInit, Component, Input, OnChanges, OnInit } from "@angular/core";

@Component({
    selector: 'app-table-default',
    templateUrl: "./table.component.html",
    styleUrls: ["./table.component.scss"]
})
export class TableDefault implements OnChanges, OnInit{
    @Input() columsArray :any;
    @Input()  expandAlarmsBool!: boolean;

    @Input() tableData:any;

    
    constructor() {}

    ngOnInit(){
       
    }

    extractDate(date: string){
        let dt = new Date(date);
        let D = dt.getDate();
        let M = dt.getMonth()+1;
        let Y = dt.getFullYear();
        let hr = dt.getHours() || '00';
        let mn = dt.getMinutes() || '00';
        let sec = dt.getSeconds() || '00';
        
        hr = hr<9? '0' + hr : hr;
        mn = mn<9? '0' + mn : mn;
        sec = sec<9? '0' + sec : sec;
        return `${D}-${M}-${Y} ${hr}:${mn}:${sec}`;
    }

    ngOnChanges() {
    }

    truncate(input: string) {
        if (input.length > 16) {
           return input.substring(0, 12) + '...';
        }
        return input;
     };
}