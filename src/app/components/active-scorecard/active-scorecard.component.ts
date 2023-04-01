import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { ActiveTeeComponent } from '../active-tee/active-tee.component';

// this component is used for displaying and editing rounds/scores user is currently playing or has completed
@Component({
  selector: 'app-active-scorecard',
  templateUrl: './active-scorecard.component.html',
  styleUrls: ['./active-scorecard.component.scss'],
})
export class ActiveScorecardComponent {
  subscriptions: Subscription = new Subscription();
  @Input() selectedScore: boolean = false;
  @Input() showScorecard!: boolean;
  signedIn: boolean = false;
  title!: string;
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
    private loadingService: LoadingService,
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
      // whether or not user selected a finished score or the score currently in progress
      if (this.selectedScore) {
        this.subscriptions.add(
          this.scoreService.selectedScoreData
            .asObservable()
            .subscribe((value) => {
              if (value) {
                this.scoreData = value;
                this.teeData = value.teeData;
                this.title = this.scoreData.courseName;
                this.removedBackNine =
                  this.scoreData.courseDetails.nineHoleGolfCourse;
                this.reload();
              }
            })
        );
      } else {
        this.subscriptions.add(
          this.scoreService.inProgressScoreData
            .asObservable()
            .subscribe((value) => {
              if (value) {
                this.scoreData = value;
                this.teeData = value.teeData;
                this.title = this.scoreData.courseName;
                this.removedBackNine =
                  this.scoreData.courseDetails.nineHoleGolfCourse;
                this.reload();
              }
            })
        );
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async reload() {
    this.isLoading = true;

    // clear scorecard of dymically added tees
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

    // count number of inputed score values
    let count = 0;
    for (let value of Object.values(this.scoreData.score)) {
      if (value != '') {
        count++;
      }
    }

    // Check whether user can submit score
    if (Object.keys(this.scoreData.score).length >= factor && count == factor) {
      // confirm user wants to submit valid score (completed)
      this.alertService.confirm(
        'Are you sure you want to submit this score?',
        { color: 'green', content: 'Confirm' },
        async () => {
          this.loadingService.loading.next(true);
          try {
            this.scoreData.statusComplete = 1;
            const response: any = await this.scoreService.update(
              this.scoreData,
              'statusComplete'
            );
            // set new hdcp from backend after inputing score
            const userData = this.authService.user.getValue();
            userData.hdcp = response.scoreData.hdcp;
            this.authService.user.next(userData);
            this.scoreService.inProgressScoreData.next(null);
            this.router.navigate(['/round', this.scoreData.id]);
          } catch (error) {}
          this.loadingService.loading.next(false);
        },
        () => {}
      );
    } else if (this.scoreData.hdcpType == 'basic') {
      // warn user that score is imcomplete and they must continue since its being used for hdcp
      this.alertService.alert(
        'This score is incomplete! You must complete every hole when calculating handicap.',
        { color: 'green', content: 'Accept' }
      );
    } else {
      // warn user that score is imcomplete and allow them to submit if score isnt being used for hdcp calculations
      this.alertService.confirm(
        'This score is incomplete! Are you sure you want to submit this score?',
        { color: 'green', content: 'Confirm' },
        async () => {
          this.loadingService.loading.next(true);
          try {
            this.scoreData.statusComplete = 1;
            await this.scoreService.update(this.scoreData, 'statusComplete');
            this.scoreService.inProgressScoreData.next(null);
            this.router.navigate(['/round', this.scoreData.id]);
          } catch (error) {}
          this.loadingService.loading.next(false);
        },
        () => {}
      );
    }
  }

  async deleteScore() {
    // confirm user wants to delete score
    this.alertService.confirm(
      'Are you sure you want to delete this score? (Cannot be undone)',
      { color: 'red', content: 'Delete' },
      async () => {
        this.loadingService.loading.next(true);
        try {
          const response: any = await this.scoreService.delete(this.scoreData);
          this.router.navigate([
            '/start-round',
            this.scoreData.googleDetails.reference,
          ]);
          // set new hdcp since user just deleted a score that might have been used in calculation
          const userData = this.authService.user.getValue();
          userData.hdcp = response.scoreData.hdcp;
          this.authService.user.next(userData);
          this.scoreService.inProgressScoreData.next(null);
        } catch (error) {}
        this.loadingService.loading.next(false);
      },
      () => {}
    );
  }

  onSubmit(data: any) {
    this.onSubmitInput.next(data);
    // after submitting data recalculate Sums for Out and In scores and Par In and Out
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == data.id[0]) {
        tee[data.id[1]] = data.value;

        if (data.id[1].charAt(0) == 'H') {
          let inNum = 0;
          let outNum = 0;
          for (let [key, value] of Object.entries(tee)) {
            if (key.charAt(0) == 'H' && key.length == 2) {
              outNum += Number(value);
            } else if (key.charAt(0) == 'H' && key.length == 3) {
              inNum += Number(value);
            }
          }
          tee['SumOut'] = outNum;
          tee['SumIn'] = inNum;
          this.scoreData.teeData['SumOut'] = outNum;
          this.scoreData.teeData['SumIn'] = inNum;
        } else if (data.id[1].charAt(0) == 'P') {
          let inNum = 0;
          let outNum = 0;
          for (let [key, value] of Object.entries(tee)) {
            if (key.charAt(0) == 'P' && key.length == 2) {
              outNum += Number(value);
            } else if (key.charAt(0) == 'P' && key.length == 3) {
              inNum += Number(value);
            }
          }
          tee['SumOutPar'] = outNum;
          tee['SumInPar'] = inNum;
          this.scoreData.teeData['SumOutPar'] = outNum;
          this.scoreData.teeData['SumInPar'] = inNum;
        }
      }
    }
    this.scoreData.teeData[data.id[1]] = data.value;
  }

  async finishEdit() {
    this.editing = false;
    // update scorecard data based on edited values
    this.courseService.editingScoreCard.next(this.editing);
    await this.courseService.updateColumn(
      this.scoreData.googleDetails.reference,
      this.scoreData.scorecard,
      'scorecard'
    );
    // update teeData with updated scorecard data for in progress score
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == this.scoreData.teeData.id) {
        this.scoreData.teeData = tee;
        await this.scoreService.update(this.scoreData, 'teeData');
      }
    }
    this.scoreService.inProgressScoreData.next(this.scoreData);
  }

  // enable editing of scorecard
  edit() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.editing = true;
    this.courseService.editingScoreCard.next(this.editing);
  }
  // switch course to a 9 hole or vice versa
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

  // creates dynamic tees on scorecard based on number of tees on scorecard
  // and the current data for the course or teeData for that score
  createTeeComponents(teeData: any) {
    const frontNineTee =
      this.frontNineContainer.createComponent(ActiveTeeComponent);
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('isFrontNine', true);
    this.selectedScore
      ? frontNineTee.setInput('selectedScore', true)
      : frontNineTee.setInput('selectedScore', false);
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
    this.selectedScore
      ? backNineTee.setInput('selectedScore', true)
      : backNineTee.setInput('selectedScore', false);
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.submitInput = this.onSubmitInput.asObservable();
  }
}
