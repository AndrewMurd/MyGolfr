import { Component } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import {
  convertDateTime,
  numberOfHolesPlayed,
} from '../../utilities/functions';

// this component displays the data for the currently selected course
@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  subscriptions: Subscription = new Subscription();
  courseData: any;
  roundInProgress: boolean = false;
  scores: any;
  signedIn!: boolean;
  convertDateTime: Function = convertDateTime;
  numberOfHolesPlayed: Function = numberOfHolesPlayed;

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

    this.subscriptions.add(
      this.courseService.courseData.asObservable().subscribe(async (value) => {
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
      })
    );

    this.subscriptions.add(
      this.authService.token.asObservable().subscribe((value) => {
        if (value) {
          this.signedIn = true;
        } else {
          this.signedIn = false;
        }
      })
    );
    
    this.scoreService.inProgressScoreData.asObservable().subscribe((value) => {
      if (value) {
        this.roundInProgress = true;
      } else {
        this.roundInProgress = false;
      }
    });
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
}
