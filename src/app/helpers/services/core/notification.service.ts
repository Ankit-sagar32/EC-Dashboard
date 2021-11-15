import { Component, Injectable, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }

  showErrorToaster(message: any, title?: any){
    this.toastr.error(message, title, {
      closeButton: true,
      timeOut: 5000,
    });
  }
}
