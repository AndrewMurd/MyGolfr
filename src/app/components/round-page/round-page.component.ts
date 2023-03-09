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

        let stringArray = this.scoreData.googleDetails.plus_code.compound_code.split(/(\s+)/);
        this.addressInfo = '';

        for (let i = 1; i < stringArray.length; i++) {
          this.addressInfo += stringArray[i];
        }
      })
    );
  }

  calculateShotsToPar() {
    const scoreToPar = (this.scoreData?.score.In + this.scoreData?.score.Out) - (this.scoreData?.teeData.SumInPar + this.scoreData?.teeData.SumOutPar);
    if (scoreToPar < 0) {
      return `-${scoreToPar}`;
    } else if (scoreToPar > 0) {
      return `+${scoreToPar}`;
    } else if (scoreToPar == 0) {
      return `${scoreToPar}`;
    }
    return '';
  }
}
