import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';

@Component({
  selector: 'app-round-page',
  templateUrl: './round-page.component.html',
  styleUrls: ['./round-page.component.scss'],
})
export class RoundPageComponent {
  subscriptions: Subscription = new Subscription();
  scoreData: any;
  addressInfo: string = '';
  date: any;
  timeDifference: any;
  scoreLn: any;

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
    this.subscriptions.add(
      this.route.params.subscribe(async (params) => {
        const response: any = await this.scoreService.get(params['id']);
        this.scoreData = response.score;
        this.scoreService.selectedScoreData.next(this.scoreData);
        this.loadingService.loading.next(false);

        console.log(this.scoreData);

        let count = 0;
        for (let [key, value] of Object.entries(this.scoreData.score)) {
          if (value != '' && key != 'In' && key != 'Out') {
            count++;
          }
        }
        this.scoreLn = count;

        this.date = this.convertSqlDateTime(this.scoreData.startTime);

        this.timeDifference = new Date(this.convertSqlDateTime(this.scoreData.endTime) - this.date).toISOString().slice(11, 19);

        console.log(this.timeDifference)

        let stringArray =
          this.scoreData.googleDetails.plus_code.compound_code.split(/(\s+)/);
        this.addressInfo = '';
        for (let i = 1; i < stringArray.length; i++) {
          this.addressInfo += stringArray[i];
        }
      })
    );
  }
  

  convertSqlDateTime(sqlDateTime: any): any {
    const dateParts = sqlDateTime.split('-');
    const timeParts = sqlDateTime.split('T')[1].split('.')[0].split(':');
    const date = new Date(
      dateParts[0],
      dateParts[1] - 1,
      dateParts[2].substr(0, 2),
      timeParts[0],
      timeParts[1],
      timeParts[2]
    );
    return date;
  }

  calculateShotsToPar() {
    const scoreToPar =
      this.scoreData?.score.In +
      this.scoreData?.score.Out -
      (this.scoreData?.teeData.SumInPar + this.scoreData?.teeData.SumOutPar);
    if (scoreToPar < 0 || scoreToPar == 0) {
      return `${scoreToPar}`;
    } else if (scoreToPar > 0) {
      return `+${scoreToPar}`;
    }
    return '';
  }
}
