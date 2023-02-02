import {
  Component,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
} from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';

@Component({
  selector: 'app-new-golf-course-score-card',
  templateUrl: './new-golf-course-score-card.component.html',
  styleUrls: ['./new-golf-course-score-card.component.scss'],
})
export class NewGolfCourseScoreCardComponent {
  colorSubmmited: boolean = false;
  @Input() title: string = 'New Golf Course ScoreCard';
  arrOfTees: [] = [];

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  onSubmit(data: any) {}

  addTee() {
    const color = 'Blue';

    const frontNineTee = this.frontNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    frontNineTee.setInput('teeColor', color);
    frontNineTee.setInput('isFrontNine', true);
    frontNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });

    const backNineTee = this.backNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    backNineTee.setInput('teeColor', color);
    backNineTee.setInput('isFrontNine', false);

    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
  }
}
