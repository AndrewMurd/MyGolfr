import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss'],
})
export class ConfirmationPopupComponent {
  confirmBtnConfig: any;
  msg!: string;
  showPopUp: boolean = false;
  hover: boolean = false;
  alert: any;
  type!: string;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.subject.asObservable().subscribe((value) => {
      if (value) {
        this.hover = false;
        this.showPopUp = true;
        this.alert = value;
        this.confirmBtnConfig = value.confirmBtnConfig;
        this.msg = value.msg;
        this.type = value.type;
      }
    });
  }

  confirm() {
    this.showPopUp = false;
    this.alert.yesFn();
  }

  cancel() {
    this.showPopUp = false;
    this.alert.noFn();
  }
}
