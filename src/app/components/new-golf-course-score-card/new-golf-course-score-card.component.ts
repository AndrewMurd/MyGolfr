import {
  Component,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
} from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ROOT_URL } from 'src/app/utilities/enviroment';

@Component({
  selector: 'app-new-golf-course-score-card',
  templateUrl: './new-golf-course-score-card.component.html',
  styleUrls: ['./new-golf-course-score-card.component.scss'],
})
export class NewGolfCourseScoreCardComponent {
  colorSubmmited: boolean = false;
  @Input() title: string = 'New Golf Course ScoreCard';
  scoreCardData: any;
  isDisabled: boolean = false;
  courseId!: string;

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(
    private resolver: ComponentFactoryResolver,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    const response: any = await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'courses/scorecard', {
          params: new HttpParams().set('id', this.courseId),
        })
        .subscribe({
          next: (data) => {
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });

    this.scoreCardData = response.scorecard;
    console.log(this.scoreCardData);

    //:ToDo: add the scorecard data from database to scorecard in view
  }

  onSubmit(data: any) {
    this.http
      .post(ROOT_URL + 'courses/set_scorecard', {
        id: this.courseId,
        data: data,
      })
      .subscribe(() => {});
  }

  addTee() {
    //:ToDo: add dynamic color change when adding new tee
    const color = 'Blue';

    this.isDisabled = true;

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
