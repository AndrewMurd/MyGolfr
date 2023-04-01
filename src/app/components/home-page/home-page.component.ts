import { Component } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
// home page is the landing page of app
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  constructor(
    private loadingService: LoadingService,
  ) {}

  ngOnInit() {
    this.loadingService.loading.next(false);
  }
}
