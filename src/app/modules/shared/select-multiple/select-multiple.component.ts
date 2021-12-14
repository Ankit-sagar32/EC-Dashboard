import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

/** @title Select with multiple selection by Rishi */
@Component({
  selector: 'app-select-multiple',
  templateUrl: './select-multiple.component.html',
  styleUrls: ['./select-multiple.component.scss']
})
export class SelectMultipleComponent implements OnInit {

  toppingsControl = new FormControl([]);
  @Input() toppingList :any[] = [];
  
  @Output() selectedDeviceEmitter: EventEmitter<any> = new EventEmitter<any>();
  //pokemonGroups: any[] = [];
  // toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  // pokemonGroups: any[] = [{
  //   devicetype: 'Network',
  //   deviceNames: [
  //     {value: 'tpec01leaf301.dci.bt.com', viewValue: 'tpec01leaf301.dci.bt.com'},
  //     {value: 'tpec01ts03.dci.bt.com', viewValue: 'tpec01ts03.dci.bt.com'},
  //     {value: 'tpec01leaf302.dci.bt.com', viewValue: 'tpec01leaf302.dci.bt.com'},
  //   ],
  // },
  // {
  //   devicetype: 'ESX',
  //   deviceNames: [
  //     {value: 'device.abc.1', viewValue: 'device.abc.1'},
  //     {value: 'device.abc.2', viewValue: 'device.abc.2'},
  //     {value: 'device.abc.3', viewValue: 'device.abc.3'},
  //   ],
  // },
  // {
  //   devicetype: 'APPID',
  //   disabled: true,
  //   deviceNames: [
  //     {value: 'APP15078', viewValue: 'APP15078'},
  //     {value: 'APP15079', viewValue: 'APP15079'},
  //   ],
  // }]
  constructor() { }

  ngOnInit(): void {
    if(!this.toppingList)
      this.toppingList = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  }


  onToppingRemoved(topping: string) {
    const toppings = this.toppingsControl.value as string[];
    this.removeFirst(toppings, topping);
    this.toppingsControl.setValue(toppings); // To trigger change detection
  }

  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  clickOption(option: any, matSelected: boolean) {
    console.log(option , " - ",matSelected);
    this.selectedDeviceEmitter.emit(option);
  }
}
