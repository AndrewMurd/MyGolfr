import { Component } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ScoreService } from 'src/app/Service/score.service';
import jwt_decode from 'jwt-decode';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { createRange } from '../../utilities/functions';

@Component({
  selector: 'app-start-round-page',
  templateUrl: './start-round-page.component.html',
  styleUrls: ['./start-round-page.component.scss'],
})
export class StartRoundPageComponent {
  selectedCourse: any;
  rBackNine: Subject<any> = new Subject<any>();
  editedScorecard: Subject<any> = new Subject<any>();
  changeView: Subject<any> = new Subject<any>();
  courseData: any;
  scoreData: any;
  roundInProgress: any;
  loading: boolean = true;
  selectedScore: any = 'Strokes';
  show10Input: boolean = false;
  strokesInputValue: number = 10;
  currentHole!: number;
  showScorecard: boolean = false;
  createRange: Function = createRange;

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
    this.courseService.courseData.next(response.course);
    this.courseData = response.course;
    this.checkCompleteTees();

    this.editedScorecard.asObservable().subscribe(async () => {
      const response: any = await this.courseService.get(
        this.selectedCourse.reference
      );
      this.courseData = response.course;
      this.checkCompleteTees();
      if (this.roundInProgress) {
        // update teeData for score in database
        await this.scoreService.update(
          this.scoreData.id,
          this.courseData.scorecard[0],
          'teeData'
        );
        this.reload();
      }
    });

    this.reload();
    this.loading = false;
  }

  async reload() {
    try {
      const response: any = await this.scoreService.getStatus(false);
      if (response.score) this.roundInProgress = true;
      this.scoreData = response.score;
      this.scoreService.scoreData = this.scoreData;
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

  checkCompleteTees() {
    if (this.courseData.courseDetails.nineHoleGolfCourse) {
      this.courseData.scorecard = this.courseData.scorecard.filter(
        (tee: any) => {
          return Object.keys(tee).length >= 31;
        }
      );
    } else {
      this.courseData.scorecard = this.courseData.scorecard.filter(
        (tee: any) => {
          return Object.keys(tee).length === 32 * 2;
        }
      );
    }
  }

  convertDateToMySql() {
    var date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}
