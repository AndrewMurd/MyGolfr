import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { CourseDetailsService } from 'src/app/Service/course-details.service';
import { ScoreService } from 'src/app/Service/score.service';
import { ActiveTeeComponent } from '../active-tee/active-tee.component';

@Component({
  selector: 'app-active-scorecard',
  templateUrl: './active-scorecard.component.html',
  styleUrls: ['./active-scorecard.component.scss']
})
export class ActiveScorecardComponent {
  signedIn: boolean = false;
  title: string = 'New Golf Course ScoreCard';
  courseId!: string;
  courseData: any;
  teeData: any;
  onSubmitInput: Subject<any> = new Subject<any>();
  removedBackNine!: boolean;
  isLoading: boolean = false;
  editing: boolean = false;

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
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });

    this.courseService.courseData.asObservable().subscribe((value) => {
      if (value) {
        this.courseData = value;
        this.title = this.courseData.name;
        this.removedBackNine = this.courseData.courseDetails.nineHoleGolfCourse;
      }
    });

    this.scoreService.scoreData.asObservable().subscribe((value) => {
      if (value) {
        this.teeData = value.teeData;
        this.reload();
      }
    });
  }

  async reload() {
    this.isLoading = true;
    
    if (this.frontNineContainer && this.backNineContainer) {
      this.frontNineContainer.clear();
      this.backNineContainer.clear();
    }

    this.createTeeComponents(this.teeData);

    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  onSubmit(data: any) {
    this.onSubmitInput.next(data);
  }

  async finishEdit() {
    this.editing = false;
    this.courseService.editingScoreCard.next(this.editing);
    const response: any = await this.courseService.get(this.courseId);
    this.courseService.courseData.next(response.course);
  }

  edit() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.editing = true;
    this.courseService.editingScoreCard.next(this.editing);
  }

  async removebacknine() {
    this.courseData.courseDetails['nineHoleGolfCourse'] =
      !this.courseData.courseDetails['nineHoleGolfCourse'];

    await this.courseService.update(
      this.courseId,
      this.courseData.courseDetails,
      'courseDetails'
    );
    this.courseService.courseData.next(this.courseData);
  }
  
  createTeeComponents(teeData: any) {
    const frontNineTee = this.frontNineContainer.createComponent(
      ActiveTeeComponent
    );
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('isFrontNine', true);
    frontNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    frontNineTee.instance.submitInput = this.onSubmitInput.asObservable();

    if (this.removedBackNine) return;
    const backNineTee = this.backNineContainer.createComponent(
      ActiveTeeComponent
    );
    backNineTee.setInput('id', teeData.id);
    backNineTee.setInput('teeData', teeData);
    backNineTee.setInput('isFrontNine', false);
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.submitInput = this.onSubmitInput.asObservable();
  }
}
