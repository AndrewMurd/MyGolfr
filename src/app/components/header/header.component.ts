import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreService } from 'src/app/Service/score.service';
import { AuthenticationService } from '../../Service/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  signedIn: boolean = false;
  userDropdown: boolean = false;
  userData: any = { name: 'Guest' };
  scoreData: any;
  isPhone!: boolean;
  isChecked: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private scoreService: ScoreService,
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

    this.scoreService.scoreData.asObservable().subscribe((value) => {
      this.scoreData = value;
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
    if (this.userDropdown && document.getElementById('userArrow') != null) {
      document.getElementById('userArrow')!.className = 'arrow up';
      document.getElementById('selectUserDropdown')!.style.height = '40px';
    } else {
      document.getElementById('userArrow')!.className = 'arrow down';
      document.getElementById('selectUserDropdown')!.style.height = '0px';
    }
  }

  closeBox() {
    this.isChecked = false;
    this.setDropdownUser(false);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }
}
