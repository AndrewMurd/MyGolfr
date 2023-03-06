import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.scss'],
})
export class StatsPageComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  scores: any;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.subscriptions.add(this.authService.user.asObservable().subscribe(async (value) => {
      if (value) {
        this.userData = value;
        try {
          const response: any = await this.scoreService.getUser(
            this.userData.id,
            1
          );
          console.log(response);
          this.scores = response.scores;
          console.log(this.scores);
        } catch (error) {
          console.log(error);
        }
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
