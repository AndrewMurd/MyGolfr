import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-new-golf-course-score-card',
  templateUrl: './new-golf-course-score-card.component.html',
  styleUrls: ['./new-golf-course-score-card.component.scss'],
})
export class NewGolfCourseScoreCardComponent {
  @Input() title: string = 'New Golf Course ScoreCard';
  isDisabled: boolean = false;
  courseId!: string;
  eventsSubject: Subject<any> = new Subject<any>();

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService
  ) {}

  async ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    const response: any = await this.courseService.getScorecard(this.courseId);

    for (let tee of response.scorecard) {
      this.addTee(tee);
    }
  }

  onSubmit(data: any) {
    this.eventsSubject.next(data);
  }

  addTee(teeData: any) {
    this.isDisabled = true;

    this.createTeeComponents(teeData);
  }

  async addNewTee() {
    this.isDisabled = true;

    const response: any = await this.courseService.setScorecard(this.courseId, { id: 'new', value: '' });

    this.createTeeComponents(response.data);
  }

  createTeeComponents(data: any) {
    const frontNineTee = this.frontNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    frontNineTee.setInput('teeData', data);
    frontNineTee.setInput('isFrontNine', true);
    frontNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    frontNineTee.instance.events = this.eventsSubject.asObservable();

    const backNineTee = this.backNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    backNineTee.setInput('teeData', data);
    backNineTee.setInput('isFrontNine', false);
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.events = this.eventsSubject.asObservable();
  }
}
