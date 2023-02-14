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
    console.log(this.authService.token.getValue());

    this.authService.token.asObservable().subscribe((value) => {
      console.log(value);
      if (value) {
        this.signedIn = true;
      }
    });
  }

  signOut() {
    this.signedIn = false;
    this.authService.logout();
  }
} 
