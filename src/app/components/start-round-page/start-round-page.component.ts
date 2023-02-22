import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ScoreService } from '../../Service/score.service';
import jwt_decode from 'jwt-decode';
import { AuthenticationService } from '../../Service/authentication.service';
import { createRange } from '../../utilities/functions';
import { EditScoreCardComponent } from '../edit-score-card/edit-score-card.component';
import { ActiveScorecardComponent } from '../active-scorecard/active-scorecard.component';

@Component({
  selector: 'app-start-round-page',
  templateUrl: './start-round-page.component.html',
  styleUrls: ['./start-round-page.component.scss'],
})
export class StartRoundPageComponent {
  selectedCourse: any;
  changeView: Subject<any> = new Subject<any>();
  courseData: any;
  completedTees: any;
  scoreData: any;
  roundInProgress: any;
  loading: boolean = true;
  selectedScore: any = 'Strokes';
  show10Input: boolean = false;
  strokesInputValue: number = 10;
  currentHole!: number;
  showScorecard: boolean = false;
  openDropdown: boolean = false;
  createRange: Function = createRange;

  @ViewChild('scorecardContainer', { read: ViewContainerRef })
  scorecardContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );
    this.courseData = response.course;
    this.completedTees = Object.assign({}, this.courseData);
    this.checkCompleteTees(this.completedTees);
    this.getScore();
    this.courseService.courseData.next(response.course);
    this.loading = false;

    this.courseService.courseData.asObservable().subscribe(async (value) => {
      if (value) {
        this.courseData = value;
        this.completedTees = Object.assign({}, this.courseData);
        this.checkCompleteTees(this.completedTees);
        if (this.roundInProgress) {
          for (let tee of this.courseData.scorecard) {
            if (tee.id == this.scoreData.teeData.id) {
              await this.scoreService.update(this.scoreData.id, tee, 'teeData');
              this.scoreData.teeData = tee;
            }
          }
          this.reload();
        }
      }
    });
  }

  async getScore() {
    try {
      const response: any = await this.scoreService.getStatus(false);
      this.roundInProgress = true;
      this.scoreData = response.score;
      this.scoreService.scoreData.next(this.scoreData);
      this.currentHole = this.getCurrentHoleInProgress(this.scoreData.score);
      this.changeView.next({
        teeData: this.scoreData.teeData,
        view: this.currentHole,
        roundInProgress: this.roundInProgress,
      });
    } catch (error) {}
  }

  async reload() {
    try {
      this.scoreService.scoreData.next(this.scoreData);
      this.currentHole = this.getCurrentHoleInProgress(this.scoreData.score);
      this.changeView.next({
        teeData: this.scoreData.teeData,
        view: this.currentHole,
        roundInProgress: this.roundInProgress,
      });
    } catch (error) {}
  }

  async startRound(tee: any) {
    try {
      const userData: any = jwt_decode(this.authService.token.getValue());
      await this.scoreService.newScore(
        userData.id,
        this.courseData.id,
        tee,
        this.convertDateToMySql()
      );
      this.reload();
    } catch (error) {
      console.log(error);
    }
  }

  submitHole() {
    console.log(this.selectedScore);
    this.scoreData.score[this.currentHole] = this.selectedScore;
    console.log(this.scoreData);
  }

  getCurrentHoleInProgress(score: any) {
    const ln = Object.keys(score).length;
    if (ln < 1) return 1;
    return ln;
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
}
