import {
  Component,
  HostListener,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ScoreService } from '../../Service/score.service';
import { AuthenticationService } from '../../Service/authentication.service';
import { createRange } from '../../utilities/functions';
import { LoadingService } from 'src/app/Service/loading.service';

@Component({
  selector: 'app-start-round-page',
  templateUrl: './start-round-page.component.html',
  styleUrls: ['./start-round-page.component.scss'],
})
export class StartRoundPageComponent {
  userData: any;
  selectedCourse: any;
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

  @ViewChild('scorecardContainer', { read: ViewContainerRef })
  scorecardContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    this.authService.user.asObservable().subscribe((value) => {
      if (value) {
        this.userData = value;
        this.getScore();
      }
    });

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );
    this.courseData = response.course;
    this.completedTees = Object.assign({}, this.courseData);
    this.checkCompleteTees(this.completedTees);
    this.courseService.courseData.next(response.course);

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
    this.scoreService.scoreData.asObservable().subscribe((value) => {
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
    });
    this.loadingService.loading.next(false);
  }

  async getScore() {
    try {
      const response: any = await this.scoreService.getUser(
        this.userData.id,
        0
      );
      this.roundInProgress = true;
      this.scoreData = response.scores[0];
      this.scoreService.scoreData.next(this.scoreData);
      this.currentHole = this.getCurrentHoleInProgress(this.scoreData.score);
      this.changeView.next({
        teeData: this.scoreData.teeData,
        view: this.currentHole,
        roundInProgress: this.roundInProgress,
      });
    } catch (error) {
      this.roundInProgress = false;
      this.changeView.next({
        teeData: 'refresh',
        view: 'course',
        roundInProgress: this.roundInProgress,
      });
    }
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
      this.scoreService.scoreData.next(this.scoreData);
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

  closePopUp() {
    
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
