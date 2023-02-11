import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CourseDetailsService } from 'src/app/Service/course-details.service';
import { ScorecardTeeComponent } from '../scorecard-tee/scorecard-tee.component';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.scss'],
})
export class ScorecardComponent {
  title: string = 'New Golf Course ScoreCard';
  courseId!: string;
  eventsSubject: Subject<any> = new Subject<any>();
  selectedCourse: any;
  editing: boolean = false;
  removedBackNine: boolean = false;
  @Output() rBackNine: EventEmitter<any> = new EventEmitter();

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);
    this.courseId = this.selectedCourse.reference;

    this.reload();
  }

  async reload() {
    const response: any = await this.courseService.get(this.courseId);

    this.title = response.course.name;
    this.removedBackNine = response.course.courseDetails.nineHoleGolfCourse;

    let teeRenderOrder = [];
    for (let tee of response.course.scorecard) {
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
  }

  finishEdit() {
    this.reload();
    this.editing = false;
  }

  createTeeComponents(teeData: any, scorecardData: any) {
    const frontNineTee = this.frontNineContainer.createComponent(
      ScorecardTeeComponent
    );
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('scorecard', scorecardData);
    frontNineTee.setInput('isFrontNine', true);

    if (this.removedBackNine) return;
    const backNineTee = this.backNineContainer.createComponent(
      ScorecardTeeComponent
    );
    backNineTee.setInput('id', teeData.id);
    backNineTee.setInput('teeData', teeData);
    backNineTee.setInput('scorecard', scorecardData);
    backNineTee.setInput('isFrontNine', false);
  }
}
