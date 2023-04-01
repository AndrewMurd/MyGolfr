import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';

// this component is used in a custom global alert/confirmation service
@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss'],
})
export class ConfirmationPopupComponent {
  subscriptions: Subscription = new Subscription();
  confirmBtnConfig: any;
  msg!: string;
  showPopUp: boolean = false;
  hover: boolean = false;
  alert: any;
  type!: string;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    // listen for new alerts from app
    this.subscriptions.add(this.alertService.subject.asObservable().subscribe((value) => {
      if (value) {
        this.hover = false;
        this.showPopUp = true;
        this.alert = value;
        this.confirmBtnConfig = value.confirmBtnConfig;
        this.msg = value.msg;
        this.type = value.type;
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // user confirmed run callback
  confirm(e: any) {
    e.stopPropagation();
    this.showPopUp = false;
    this.alert.yesFn();
  }

  // user confirmed cancelled run callback
  cancel(e: any) {
    e.stopPropagation();
    this.showPopUp = false;
    this.alert.noFn();
  }
}
