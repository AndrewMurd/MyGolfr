import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../Service/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  signedIn: boolean = false;
  userDropdown: boolean = false;
  userData: any;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });

    this.authService.user.asObservable().subscribe((value) => {
      if (value) {
        this.userData = value;
      }
    });
  }

  signOut() {
    this.signedIn = false;
    this.authService.token.next(null);
    this.authService.user.next(null);
    this.router.navigate(['/login']);
    this.authService.logout();
  }

  setDropdownUser(set: boolean) {
    this.userDropdown = set;
    if (this.userDropdown) {
      document.getElementById('userArrow')!.className = 'arrow up';
      document.getElementById('selectUserDropdown')!.style.height = '40px';
    } else {
      document.getElementById('userArrow')!.className = 'arrow down';
      document.getElementById('selectUserDropdown')!.style.height = '0px';
    }
  }
}
