import { Component } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';
import { convertSqlDateTime } from '../../utilities/functions';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  subscriptions: Subscription = new Subscription();
  courseData: any;
  scores: any;
  signedIn!: boolean;

  constructor(
    private courseService: CourseDetailsService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(
      this.route.params.subscribe(async (params) => {
        const response: any = await this.courseService.get(params['id']);
        this.courseService.courseData.next(response.course);
      })
    );

    this.subscriptions.add(this.courseService.courseData.asObservable().subscribe(async (value) => {
      if (value) {
        this.courseData = value;
        try {
          const scoresRes: any = await this.scoreService.getCourse(
            this.courseData.id,
            1
          );
          this.scores = scoresRes.scores;
        } catch (error) {}
        this.loadingService.loading.next(false);
      }
    }));

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  startRound() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/start-round', this.courseData.id]);
  }

  navigateToRounds(score: any) {
    this.router.navigate(['/rounds', score.userId]);
  }

  navigateToRound(score: any) {
    this.router.navigate(['/round', score.id]);
  }

  numberOfHolesPlayed(score: any) {
    let count = 0;
    for (let [key, value] of Object.entries(score.score)) {
      if (value != '' && key != 'In' && key != 'Out') {
        count++;
      }
    }
    return count;
  }

  convertDateTime(score: any) {
    const currentDateTime: any = new Date();
    const diffTime = currentDateTime - convertSqlDateTime(score.endTime);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (Math.round(diffDays * 24) < 1) {
      return `${Math.round(diffDays * 24 * 48)} mins`;
    } else if (diffDays <= 3) {
      return `${Math.round(diffDays * 24)} hours`;
    } else {
      return `${Math.floor(diffDays)} days`;
    }
  }
}
