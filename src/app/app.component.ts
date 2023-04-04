import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { CourseDetailsService } from './services/course-details.service';
import { LoadingService } from './services/loading.service';
import { ScoreService } from './services/score.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loading: boolean = false;
  userData: any;

  constructor(
    private authService: AuthenticationService,
    private courseService: CourseDetailsService,
    private loadingService: LoadingService,
    private scoreService: ScoreService,
    router: Router
  ) {
    router.events.subscribe((value) => {
      this.courseService.editingScoreCard.next(false);
      this.courseService.courseData.next(null);
    });
  }

  async ngOnInit() {
    this.loading = true;
    // refresh login token
    try {
      const res: any = await this.authService.refresh();
      if (res.accessToken) {
        this.authService.token.next(res.accessToken);
      }
      this.userData = jwt_decode(this.authService.token.getValue());
      this.authService.user.next(this.userData);
    } catch (error) {
      this.authService.token.next('');
    }
    // check whether user has in progress rounds
    try {
      const response: any = await this.scoreService.getUser(this.userData.id, 0);
      this.scoreService.inProgressScoreData.next(response.scores[0]);
    } catch (error) {}
    this.loading = false;
    
    this.loadingService.loading.asObservable().subscribe((value) => {
      // disable or enable body scrolling based whether app is loading
      this.loading = value;
    });
  }
}
