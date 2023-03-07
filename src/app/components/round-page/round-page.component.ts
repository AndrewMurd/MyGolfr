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
      })
    );
  }
}
