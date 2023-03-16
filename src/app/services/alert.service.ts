import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  subject = new Subject<any>();

  confirm(
    msg: string,
    confirmBtnConfig: any,
    yesFn: () => void,
    noFn: () => void
  ) {
    this.subject.next({
      type: 'confirm',
      msg: msg,
      confirmBtnConfig: confirmBtnConfig,
      yesFn: () => {
        this.subject.next(null);
        yesFn();
      },
      noFn: () => {
        this.subject.next(null);
        noFn();
      },
    });
  }

  alert(msg: string, confirmBtnConfig: any) {
    this.subject.next({
      type: 'alert',
      msg: msg,
      confirmBtnConfig: confirmBtnConfig,
      yesFn: () => {
        this.subject.next(null);
      },
    });
  }
}
