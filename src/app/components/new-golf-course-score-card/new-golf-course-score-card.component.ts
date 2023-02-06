import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

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
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.reload();
  }

  async reload() {

    const response: any = await this.courseService.getScorecard(this.courseId);

    let teeRenderOrder = [];
    for (let tee of response.scorecard) {
      document.getElementById(tee.id)?.remove();
      document.getElementById(tee.id)?.remove();
      teeRenderOrder.push(tee);
    }

    teeRenderOrder.sort((a: any, b: any): any => {
      return a.Position - b.Position;
    });

    for (let teeToRender of teeRenderOrder) {
      this.createTeeComponents(teeToRender, response.scorecard);
    }
    console.log(response.scorecard);
  }

  onSubmit(data: any) {
    this.eventsSubject.next(data);
  }

  async addNewTee() {
    const response: any = await this.courseService.setScorecardValue(this.courseId, { id: 'new', value: '' });
    this.reload();
    // this.createTeeComponents(response.data);
  }

  createTeeComponents(teeData: any, scorecardData: any) {
    const frontNineTee = this.frontNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('scorecard', scorecardData);
    frontNineTee.setInput('isFrontNine', true);
    frontNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    frontNineTee.instance.onReload.subscribe((value) => {
      this.reload();
    });
    frontNineTee.instance.events = this.eventsSubject.asObservable();

    const backNineTee = this.backNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    backNineTee.setInput('id', teeData.id);
    backNineTee.setInput('teeData', teeData);
    backNineTee.setInput('scorecard', scorecardData);
    backNineTee.setInput('isFrontNine', false);
    backNineTee.instance.onReload.subscribe((value) => {
      this.reload();
    });
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.events = this.eventsSubject.asObservable();
  }
}
