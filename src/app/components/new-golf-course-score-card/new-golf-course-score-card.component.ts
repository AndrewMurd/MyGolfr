import { Component } from '@angular/core';

@Component({
  selector: 'app-new-golf-course-score-card',
  templateUrl: './new-golf-course-score-card.component.html',
  styleUrls: ['./new-golf-course-score-card.component.scss']
})
export class NewGolfCourseScoreCardComponent {
  createRange(number: number){
    // return new Array(number);
    return new Array(number).fill(0)
      .map((n, index) => index + 1);
  }
}
