import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { CourseDetailsService } from 'src/app/Service/course-details.service';
import { LoadingService } from 'src/app/Service/loading.service';
import { ScoreService } from 'src/app/Service/score.service';

@Component({
  selector: 'app-rounds-page',
  templateUrl: './rounds-page.component.html',
  styleUrls: ['./rounds-page.component.scss'],
})
export class RoundsPageComponent {
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
    this.authService.user.asObservable().subscribe(async (value) => {
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
    });
  }
}
