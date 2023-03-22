import { Component } from '@angular/core';
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
  styleUrls: ['./round-in-progress-page.component.scss'],
})
export class RoundInProgressPageComponent {
  subscriptions: Subscription = new Subscription();
  changeView: Subject<any> = new Subject<any>();
  scoreData: any;
  selectedScore: any = 'Strokes';
  show10Input: boolean = false;
  strokesInputValue: number = 10;
  currentHole: any;
  showScorecard: boolean = false;
  openScoreDropdown: Boolean = false;
  popUp: boolean = false;
  createRange: Function = createRange;

  constructor(
    private courseService: CourseDetailsService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);

    this.subscriptions.add(
      this.scoreService.inProgressScoreData
        .asObservable()
        .subscribe((value) => {
          if (value) {
            this.scoreData = value;
            if (this.scoreData.score[this.currentHole]) {
              this.selectedScore = this.scoreData.score[this.currentHole];
            } else {
              this.selectedScore = 'Strokes';
            }
            this.reload();
            this.loadingService.loading.next(false);
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async reload() {
    this.currentHole = this.getCurrentHoleInProgress(this.scoreData.score);
    this.changeView.next(this.currentHole);
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
    if (ln == 2) return 1;
    return ln - 2;
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
