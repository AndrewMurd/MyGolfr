import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scorecard-header',
  templateUrl: './scorecard-header.component.html',
  styleUrls: ['./scorecard-header.component.scss'],
})
export class ScorecardHeaderComponent {
  @Input() isFrontNine!: boolean;

  createRange(number: number) {
    // return new Array(number);
    return new Array(number).fill(0).map((n, index) => index + 1);
  }
}
