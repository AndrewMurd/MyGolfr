import { Component } from '@angular/core';
import { AuthenticationService } from './Service/authentication.service';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { CourseDetailsService } from './Service/course-details.service';
import { LoadingService } from './Service/loading.service';
import { ScoreService } from './Service/score.service';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loading: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private courseService: CourseDetailsService,
    private loadingService: LoadingService,
    private scoreService: ScoreService,
    router: Router
  ) {
    router.events.subscribe((value) => {
      this.courseService.editingScoreCard.next(false);
    });
  }

  async ngOnInit() {
    // refresh login token
    try {
      const res: any = await this.authService.refresh();
      if (res.accessToken) {
        this.authService.token.next(res.accessToken);
      }
      const userData: any = jwt_decode(this.authService.token.getValue());
      this.authService.user.next(userData);
      const response: any = await this.scoreService.getUser(
        userData.id,
        0
      );
      this.scoreService.scoreData.next(response.scores[0]);
    } catch (error) {}
    this.loadingService.loading.asObservable().subscribe((value) => {
      const body = document.getElementsByTagName('body')[0];
      if (!value) {
        enableBodyScroll(body);
      } else {
        disableBodyScroll(body);
      }
      this.loading = value;
    });
  }
}
