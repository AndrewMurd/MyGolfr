import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  constructor(private authService: AuthenticationService) {}

  // ngOnInit() {
  //   setTimeout(() => {
  //     this.authService.token.asObservable().subscribe((value) => {
  //       console.log(value);
  //     });
  //   }, 10000)
  // }
}
