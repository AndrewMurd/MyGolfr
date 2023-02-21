import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take } from 'rxjs';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { CourseDetailsService } from 'src/app/Service/course-details.service';
import { ScoreService } from 'src/app/Service/score.service';
import { ScorecardTeeComponent } from '../scorecard-tee/scorecard-tee.component';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.scss'],
})
export class ScorecardComponent {
  courseData: any;
  signedIn: boolean = false;
  title: string = 'New Golf Course ScoreCard';
  courseId!: string;
  eventsSubject: Subject<any> = new Subject<any>();
  selectedCourse: any;
  editing: boolean = false;
  removedBackNine: boolean = false;
  roundInProgress: boolean = false;
  @Input() editable: boolean = true;
  @Output() rBackNine: EventEmitter<any> = new EventEmitter();
  @Output() editedScorecard: EventEmitter<any> = new EventEmitter();

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);
    this.courseId = this.selectedCourse.reference;

    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });

    this.courseService.courseData.asObservable().subscribe((value) => {
      if (value && !this.editing) {
        this.courseData = value;
        this.reload(true);
      }
    });

    this.scoreService.scoreData.asObservable().subscribe((value) => {
      if (value) {
        this.courseData = value;
        this.roundInProgress = true;
      }
    });
  }

  async reload(isInit: boolean) {
    if (!isInit) {
      const response: any = await this.courseService.get(this.courseId);
      this.courseData = response.course;
    }

    this.title = this.courseData.name;
    this.removedBackNine = this.courseData.courseDetails.nineHoleGolfCourse;

    let teeRenderOrder = [];
    for (let tee of this.courseData.scorecard) {
      document.getElementById(tee.id)?.remove();
      document.getElementById(tee.id)?.remove();
      teeRenderOrder.push(tee);
    }

    teeRenderOrder.sort((a: any, b: any): any => {
      return a.Position - b.Position;
    });

    for (let teeToRender of teeRenderOrder) {
      this.createTeeComponents(teeToRender, this.courseData.scorecard);
    }
  }

  finishEdit() {
    this.reload(false);
    this.editedScorecard.emit();
    this.editing = false;
  }

  edit() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.editing = true; 
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
