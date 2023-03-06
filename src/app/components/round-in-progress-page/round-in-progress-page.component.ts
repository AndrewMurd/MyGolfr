import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { createRange } from 'src/app/utilities/functions';

@Component({
  selector: 'app-round-in-progress-page',
  templateUrl: './round-in-progress-page.component.html',
  styleUrls: ['./round-in-progress-page.component.scss']
})
export class RoundInProgressPageComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  changeView: Subject<any> = new Subject<any>();
  courseData: any;
  completedTees: any;
  scoreData: any;
  roundInProgress: any;
  selectedScore: any = 'Strokes';
  show10Input: boolean = false;
  strokesInputValue: number = 10;
  currentHole: any;
  showScorecard: boolean = false;
  openScoreDropdown: Boolean = false;
  openTeeDropdown: Boolean = false;
  popUp: boolean = false;
  createRange: Function = createRange;
  
  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(this.route.params.subscribe(async (params) => {
      const response: any = await this.courseService.get(
        params['id']
      );
      this.courseService.courseData.next(response.course);
    }));

    this.subscriptions.add(this.authService.user.asObservable().subscribe((value) => {
      if (value) {
        this.userData = value;
        this.getScore();
      }
    }));

    this.subscriptions.add(this.courseService.courseData.asObservable().subscribe(async (value) => {
      if (value) {
        this.courseData = value;
        this.completedTees = Object.assign({}, this.courseData);
        this.checkCompleteTees(this.completedTees);
        if (this.roundInProgress) {
          for (let tee of this.courseData.scorecard) {
            if (
              tee.id == this.scoreData.teeData.id &&
              JSON.stringify(tee) != JSON.stringify(this.scoreData.teeData)
            ) {
              await this.scoreService.update(this.scoreData.id, tee, 'teeData');
              this.scoreData.teeData = tee;
            }
          }
          this.reload();
          this.changeView.next(this.currentHole);
        }
      }
    }));
    this.subscriptions.add(this.scoreService.inProgressScoreData.asObservable().subscribe((value) => {
      if (value) {
        this.scoreData = value;
        try {
          if (this.scoreData.score[this.currentHole]) {
            this.selectedScore = this.scoreData.score[this.currentHole];
          } else {
            this.selectedScore = 'Strokes';
          }
        } catch (error) {}
      }
    }));
    this.loadingService.loading.next(false);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async getScore() {
    try {
      const response: any = await this.scoreService.getUser(
        this.userData.id,
        0
      );
      this.roundInProgress = true;
      this.scoreData = response.scores[0];
      this.scoreService.inProgressScoreData.next(this.scoreData);
      this.currentHole = this.getCurrentHoleInProgress(this.scoreData.score);
      this.courseData = this.scoreData;
      this.completedTees = Object.assign({}, this.courseData);
      this.checkCompleteTees(this.completedTees);
      this.courseService.courseData.next(this.courseData);
      this.changeView.next(this.currentHole);
    } catch (error) {
      const response: any = await this.courseService.get(
        this.courseData.id
      );
      this.courseData = response.course;
      this.completedTees = Object.assign({}, this.courseData);
      this.checkCompleteTees(this.completedTees);

      this.roundInProgress = false;
      this.changeView.next('course');
    }
  }

  async reload() {
    try {
      this.scoreService.inProgressScoreData.next(this.scoreData);
      this.currentHole = this.getCurrentHoleInProgress(this.scoreData.score);
      this.changeView.next(this.currentHole);
    } catch (error) {}
  }

  async startRound(tee: any) {
    try {
      await this.scoreService.newScore(
        this.userData.id,
        this.courseData.id,
        tee,
        this.convertDateToMySql()
      );
      this.getScore();
    } catch (error) {
      console.log(error);
    }
  }

  async updateScore(strokes: any) {
    this.selectedScore = strokes;
    if (
      strokes != 'Strokes' &&
      strokes != this.scoreData.score[this.currentHole]
    ) {
      this.scoreData.score[this.currentHole] = this.selectedScore;
      const response: any = await this.scoreService.update(
        this.scoreData.id,
        this.scoreData.score,
        'score'
      );
      this.scoreData.score = response.data;
      this.scoreService.inProgressScoreData.next(this.scoreData);
    }
  }

  async setCurrentHole(a: any) {
    this.currentHole = a;
    if (this.currentHole == 'course') {
      document.getElementById('scoreInput')!.style.top = '65px';
    } else {
      document.getElementById('scoreInput')!.style.top = '145px';
    }
    try {
      if (this.scoreData.score[this.currentHole]) {
        this.selectedScore = this.scoreData.score[this.currentHole];
      } else {
        this.selectedScore = 'Strokes';
      }
    } catch (error) {}
  }

  getCurrentHoleInProgress(score: any) {
    const ln = Object.keys(score).length;
    if (ln < 1) return 1;
    return ln - 2;
  }

  checkCompleteTees(data: any) {
    let courseData = data;
    if (courseData.courseDetails.nineHoleGolfCourse) {
      courseData.scorecard = courseData.scorecard.filter((tee: any) => {
        return Object.keys(tee).length >= 31;
      });
    } else {
      courseData.scorecard = courseData.scorecard.filter((tee: any) => {
        return Object.keys(tee).length === 32 * 2;
      });
    }
    return courseData;
  }

  convertDateToMySql() {
    var date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  clickedOutside() {
    this.teeDropdown(false);
    this.scoreDropdown(false);
  }

  teeDropdown(set: boolean) {
    this.openTeeDropdown = set;
    let pixels = 44 * this.completedTees?.scorecard.length;
    try {
      if (this.openTeeDropdown) {
        document.getElementById(
          'selectTeeBtnSlide'
        )!.style.height = `${pixels}px`;
      } else {
        document.getElementById('selectTeeBtnSlide')!.style.height = '0px';
      }
    } catch (error) {}
  }

  scoreDropdown(set: boolean) {
    this.openScoreDropdown = set;
    let pixels = 34 * 10;
    try {
      if (this.openScoreDropdown) {
        document.getElementById(
          'selectScoreBtnSlide'
        )!.style.height = `${pixels}px`;
      } else {
        document.getElementById('selectScoreBtnSlide')!.style.height = '0px';
      }
    } catch (error) {}
  }
}
