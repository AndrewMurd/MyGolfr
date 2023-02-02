import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-new-scorecard-tee',
  templateUrl: './new-scorecard-tee.component.html',
  styleUrls: ['./new-scorecard-tee.component.scss'],
})
export class NewScorecardTeeComponent {
  @Input() teeColor!: string;
  @Input() isFrontNine: boolean = true;
  @Output() onSubmitofInput: EventEmitter<any> = new EventEmitter;

  onSubmit(data: any) {
    this.onSubmitofInput.emit(data);
  }

  createRange(number: number) {
    // return new Array(number);
    return new Array(number).fill(0).map((n, index) => index + 1);
  }
}
