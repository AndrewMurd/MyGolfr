import { Component } from '@angular/core';
import { AuthenticationService } from '../../Service/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {  
  signedIn: boolean = false;

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });
  }

  signOut() {
    this.signedIn = false;
    this.authService.logout();
  }
} 
