import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { ScoreService } from 'src/app/services/score.service';
import { ActiveTeeComponent } from '../active-tee/active-tee.component';

@Component({
  selector: 'app-active-scorecard',
  templateUrl: './active-scorecard.component.html',
  styleUrls: ['./active-scorecard.component.scss'],
})
export class ActiveScorecardComponent {
  subscriptions: Subscription = new Subscription();
  signedIn: boolean = false;
  title!: string;
  // courseData: any;
  scoreData: any;
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
    private alertService: AlertService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });
  }

  async ngAfterViewInit() {
    setTimeout(() => {
      this.subscriptions.add(this.scoreService.inProgressScoreData.asObservable().subscribe((value) => {
        if (value) {
          this.scoreData = value;
          this.teeData = value.teeData;
          this.title = this.scoreData.name;
          this.removedBackNine = this.scoreData.courseDetails.nineHoleGolfCourse;
          this.reload();
        }
      }));
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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

  async submitScore() {
    let factor = 0;
    this.scoreData.courseDetails.nineHoleGolfCourse
      ? (factor = 10)
      : (factor = 20);

    if (Object.keys(this.scoreData.score).length >= factor) {
      this.alertService.confirm(
        'Are you sure you want to submit this score?',
        { color: 'green', content: 'Confirm' },
        'confirm',
        async () => {
          try {
            await this.scoreService.update(
              this.scoreData.id,
              1,
              'statusComplete'
            );
            this.scoreService.inProgressScoreData.next(null);
            this.router.navigate(['/stats']);
          } catch (error) {}
        },
        () => {}
      );
    } else {
      this.alertService.confirm(
        'This scorecard is incomplete!',
        { color: 'green', content: 'Ok' },
        'alert',
        () => {},
        () => {}
      );
    }
  }

  async deleteScore() {
    this.alertService.confirm(
      'Are you sure you want to delete this score? (Cannot be undone)',
      { color: 'red', content: 'Delete' },
      'confirm',
      async () => {
        try {
          await this.scoreService.delete(this.scoreData.id);
          this.router.navigate(['/start-round', this.scoreData.googleDetails.reference]);
          this.scoreService.inProgressScoreData.next(null);
        } catch (error) {}
      },
      () => {}
    );
  }

  onSubmit(data: any) {
    this.onSubmitInput.next(data);
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == data.id[0]) {
        tee[data.id[1]] = data.value;
      }
    }
    this.scoreData.teeData[data.id[1]] = data.value;
  }

  async finishEdit() {
    this.editing = false;
    this.courseService.editingScoreCard.next(this.editing);
    await this.courseService.updateColumn(
      this.scoreData.googleDetails.reference,
      this.scoreData.scorecard,
      'scorecard'
    );
    for (let tee of this.scoreData.scorecard) {
      if (
        tee.id == this.scoreData.teeData.id &&
        JSON.stringify(tee) != JSON.stringify(this.scoreData.teeData)
      ) {
        await this.scoreService.update(this.scoreData.id, tee, 'teeData');
        this.scoreData.teeData = tee;
      }
    }
    this.scoreService.inProgressScoreData.next(this.scoreData);
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
    this.scoreData.courseDetails['nineHoleGolfCourse'] =
      !this.scoreData.courseDetails['nineHoleGolfCourse'];

    await this.courseService.updateColumn(
      this.scoreData.googleDetails.reference,
      this.scoreData.courseDetails,
      'courseDetails'
    );
    this.scoreService.inProgressScoreData.next(this.scoreData);
  }

  createTeeComponents(teeData: any) {
    const frontNineTee =
      this.frontNineContainer.createComponent(ActiveTeeComponent);
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('isFrontNine', true);
    frontNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    frontNineTee.instance.submitInput = this.onSubmitInput.asObservable();

    if (this.removedBackNine) return;
    const backNineTee =
      this.backNineContainer.createComponent(ActiveTeeComponent);
    backNineTee.setInput('id', teeData.id);
    backNineTee.setInput('teeData', teeData);
    backNineTee.setInput('isFrontNine', false);
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.submitInput = this.onSubmitInput.asObservable();
  }
}
