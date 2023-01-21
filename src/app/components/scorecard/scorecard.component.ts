import { Component } from '@angular/core';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.scss']
})
export class ScorecardComponent {
  

  createRange(number: number){
    // return new Array(number);
    return new Array(number).fill(0)
      .map((n, index) => index + 1);
  }
}
