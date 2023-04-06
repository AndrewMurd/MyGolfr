import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { Location } from '@angular/common';

// profile page uses the rounds page and stats page component to display profile information for user
@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent {
  subscriptions: Subscription = new Subscription();
  rounds!: boolean;
  limit: number = 40;
  scoresSubject = new BehaviorSubject<any>(null);
  id!: string;
  rendered: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    this.subscriptions.add(
      this.route.params.subscribe(async (params) => {
        this.rendered = false;
        this.loadingService.loading.next(true);
        if (params['location'] == 'stats') {
          this.rounds = false;
        } else {
          this.rounds = true;
        }
        this.id = params['id'];
        this.setUnderline();
        try {
          const response: any = await this.scoreService.getUser(
            params['id'],
            2,
            this.limit
          );
          this.rendered = true;
          this.scoresSubject.next(response.scores);

          this.loadingService.loading.next(false);
        } catch (error) {
          this.loadingService.loading.next(false);
          this.scoresSubject.next([]);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setUnderline() {
    const green = '#7cfc00';
    const roundsLink = document.getElementById('roundsLink');
    const roundsBorder = document.getElementById('roundsBorder');
    const statsLink = document.getElementById('statsLink');
    const statsBorder = document.getElementById('statsBorder');
    const header = document.getElementById('profileHeader');
    if (this.rounds) {
      this.location.replaceState(`profile/rounds/${this.id}`);
      statsBorder!.style.backgroundColor = 'transparent';
      // statsLink!.style.backgroundPosition = '-100%';
      roundsBorder!.style.backgroundColor = green;
      header!.style.maxWidth = '1300px';
      header!.style.top = '75px';
      // roundsLink!.style.backgroundPosition = '0';
    } else {
      this.location.replaceState(`profile/stats/${this.id}`);
      roundsBorder!.style.backgroundColor = 'transparent';
      // roundsLink!.style.backgroundPosition = '-100%';
      statsBorder!.style.backgroundColor = green;
      header!.style.maxWidth = '1100px';
      header!.style.top = '50px';
      // statsLink!.style.backgroundPosition = '0px';
    }
  }
}
