import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { ActiveTeeComponent } from '../active-tee/active-tee.component';
import * as moment from 'moment';
import {
  modelAggregated18,
  modelAggregated9,
  modelNormal18,
  modelNormal9,
} from 'src/app/utilities/models';

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
  isUser: boolean = true;
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
    this.subscriptions.add(
      this.authService.token.asObservable().subscribe((value) => {
        if (value) {
          this.signedIn = true;
        } else {
          this.signedIn = false;
        }
      })
    );
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
                this.getUser();
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
                this.getUser();
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

  getUser() {
    this.subscriptions.add(
      this.authService.user.asObservable().subscribe(async (value) => {
        if (value) {
          // check whether to allow user to edit the score based on logged in user
          if (this.scoreData.userId == value.id) {
            this.isUser = true;
          } else {
            this.isUser = false;
          }
        }
      })
    );
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
    this.isLoading = false;
  }

  checkTeeData() {
    if (this.scoreData.courseDetails.nineHoleGolfCourse) {
      let model;
      if (this.teeData.Aggregated) model = modelAggregated9;
      else model = modelNormal9;
      for (let [key, value] of Object.entries(this.teeData)) {
        if (key in model) {
          model[key] = true;
        }
      }
      let complete = true;
      for (let [key, value] of Object.entries(model)) {
        if (!value) {
          complete = false;
          break;
        }
      }
      if (!complete) {
        this.alertService.alert(
          'The data for this tee is incomplete! You must complete the data by editing the scorecard.',
          {
            color: 'green',
            content: 'Accept',
          }
        );
        return false;
      }
      return true;
    } else {
      let model;
      if (this.teeData.Aggregated) model = modelAggregated18;
      else model = modelNormal18;
      for (let [key, value] of Object.entries(this.teeData)) {
        if (key in model) {
          model[key] = true;
        }
      }
      let complete = true;
      for (let [key, value] of Object.entries(model)) {
        if (!value) {
          complete = false;
          break;
        }
      }
      if (!complete) {
        this.alertService.alert(
          'The data for this tee is incomplete! You must complete the data by editing the scorecard.',
          {
            color: 'green',
            content: 'Accept',
          }
        );
        return false;
      }
      return true;
    }
  }

  async submitScore() {
    if (!this.checkTeeData()) return;

    // check whether user should be able to switch round to count towards hdcp calculation
    if (this.scoreData.hdcpType == 'basic') {
      // need a slope and rating for calculating hdcp
      if (
        this.scoreData.teeData.Rating == '' ||
        this.scoreData.teeData.Rating == undefined ||
        this.scoreData.teeData.Slope == '' ||
        this.scoreData.teeData.Rating == undefined
      ) {
        this.alertService.alert(
          'Must enter Slope Rating and Course Rating for Basic Mode (Needed for Handicap Calculation).',
          {
            color: 'green',
            content: 'Accept',
          }
        );
        return;
      }
    }

    let factorScore = 0;
    this.scoreData.courseDetails.nineHoleGolfCourse
      ? (factorScore = 10)
      : (factorScore = 20);

    // count number of inputed score values
    let countScore = 0;
    for (let value of Object.values(this.scoreData.score)) {
      if (value != '') countScore++;
    }

    // Check whether user can submit score
    if (
      Object.keys(this.scoreData.score).length >= factorScore &&
      countScore == factorScore
    ) {
      // confirm user wants to submit valid score (completed)
      this.alertService.confirm(
        'Are you sure you want to submit this score?',
        { color: 'green', content: 'Confirm' },
        async () => {
          this.loadingService.loading.next(true);
          try {
            this.scoreData.statusComplete = 1;
            this.scoreData.endTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
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
      this.alertService.confirm(
        'This score is incomplete! Are you sure you want to submit this score? (Incomplete Basic round will revert to None)',
        { color: 'green', content: 'Confirm' },
        async () => {
          this.loadingService.loading.next(true);
          try {
            this.scoreData.statusComplete = 1;
            this.scoreData.hdcpType = 'none';
            await this.scoreService.update(this.scoreData, 'hdcpType');
            this.scoreData.endTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
            await this.scoreService.update(this.scoreData, 'statusComplete');
            this.scoreService.inProgressScoreData.next(null);
            this.router.navigate(['/round', this.scoreData.id]);
          } catch (error) {}
          this.loadingService.loading.next(false);
        },
        () => {}
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
            this.scoreData.endTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
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
    this.teeData[data.id[1]] = data.value;
  }

  async finishEdit() {
    if (this.scoreData.statusComplete == 1) {
      if (!this.checkTeeData()) return;
      // check whether user should be able to switch round to count towards hdcp calculation
      if (this.scoreData.hdcpType == 'basic') {
        // need a slope and rating for calculating hdcp
        if (
          this.scoreData.teeData.Rating == '' ||
          this.scoreData.teeData.Rating == undefined ||
          this.scoreData.teeData.Slope == '' ||
          this.scoreData.teeData.Rating == undefined
        ) {
          this.alertService.alert(
            'Must enter Slope Rating and Course Rating for Basic Mode (Needed for Handicap Calculation).',
            {
              color: 'green',
              content: 'Accept',
            }
          );
          return;
        }
      }
    }

    this.editing = false;
    this.courseService.editingScoreCard.next(this.editing);
    if (this.scoreData.statusComplete == 0) {
      // update scorecard data based on edited values
      await this.courseService.updateColumn(
        this.scoreData.googleDetails.reference,
        this.scoreData.scorecard,
        'scorecard'
      );
      this.scoreService.inProgressScoreData.next(this.scoreData);
    } else {
      this.scoreService.selectedScoreData.next(this.scoreData);
      if (this.scoreData.hdcpType == 'basic') {
        const response: any = await this.scoreService.update(
          this.scoreData,
          'score'
        );
        this.scoreData = response.scoreData;
        const userData = this.authService.user.getValue();
        userData.hdcp = this.scoreData.hdcp;
        this.authService.user.next(userData);
      }
    }
    // update teeData with updated scorecard data for in progress score
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == this.scoreData.teeData.id) {
        this.scoreData.teeData = tee;
        await this.scoreService.update(this.scoreData, 'teeData');
      }
    }
    this.reload();
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
    frontNineTee.instance.loading.subscribe((value) => {
      this.isLoading = value;
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
    backNineTee.instance.loading.subscribe((value) => {
      this.isLoading = value;
    });
    backNineTee.instance.submitInput = this.onSubmitInput.asObservable();
  }
}
