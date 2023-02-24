import { Component } from '@angular/core';
import { AuthenticationService } from './Service/authentication.service';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { CourseDetailsService } from './Service/course-details.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private authService: AuthenticationService,
    private courseService: CourseDetailsService,
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
    } catch (error) {}
  }
}
