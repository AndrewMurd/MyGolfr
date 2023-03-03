import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  subject = new Subject<any>();
  
  confirm(msg: string, confirmBtnConfig: any, type: string, yesFn: () => void, noFn: () => void) {
    this.subject.next({
      type: type,
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
}
