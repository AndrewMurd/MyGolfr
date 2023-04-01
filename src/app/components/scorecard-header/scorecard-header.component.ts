import { Component, Input } from '@angular/core';
import { createRange } from '../../utilities/functions';

// header used in dynamically added tees
@Component({
  selector: 'app-scorecard-header',
  templateUrl: './scorecard-header.component.html',
  styleUrls: ['./scorecard-header.component.scss'],
})
export class ScorecardHeaderComponent {
  @Input() isFrontNine!: boolean;
  createRange: Function = createRange;
}
