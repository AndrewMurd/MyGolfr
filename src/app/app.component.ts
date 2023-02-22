import { Component } from '@angular/core';
import { AuthenticationService } from './Service/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private authService: AuthenticationService) {}

  async ngOnInit() {
    // refresh login token
    try {
      const res: any = await this.authService.refresh();
      if (res.accessToken) {
        this.authService.token.next(res.accessToken);
      }
    } catch (error) {}
  }
}
