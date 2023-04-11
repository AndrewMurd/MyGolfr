import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';
import { AuthenticationService } from '../../services/authentication.service';

// header component for entire app
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  subscriptions: Subscription = new Subscription();
  @Input() height: string = '60px';
  signedIn: boolean = false;
  userDropdown: boolean = false;
  userData: any = { name: 'Guest' };
  scoreData: any;
  isPhone!: boolean;
  isChecked: boolean = false;
  showAccount: boolean = false;
  showSocial: boolean = false;
  showAccountSub: Subject<any> = new Subject<any>();
  showSocialSub: Subject<any> = new Subject<any>();

  constructor(
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  ngOnInit() {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }

    this.subscriptions.add(
      this.authService.token.asObservable().subscribe((value) => {
        if (value) {
          this.signedIn = true;
        } else {
          this.signedIn = false;
        }
      })
    );

    this.subscriptions.add(
      this.authService.user.asObservable().subscribe(async (value) => {
        if (value) {
          this.userData = value;
        }
      })
    );

    this.subscriptions.add(
      this.scoreService.inProgressScoreData
        .asObservable()
        .subscribe((value) => {
          this.scoreData = value;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  // sign out user
  signOut() {
    this.signedIn = false;
    this.authService.token.next(null);
    this.authService.user.next(null);
    this.scoreService.inProgressScoreData.next(null);
    this.router.navigate(['/login']);
    this.authService.logout();
  }
  // dynamically change arrow icon and height of user dropdown
  setDropdownUser(set: boolean) {
    this.userDropdown = set;
    try {
      if (this.userDropdown) {
        document.getElementById('userArrow')!.className = 'arrow up';
        document.getElementById('selectUserDropdown')!.style.height = '120px';
        // document.getElementById('userLinkContainer')!.classList.add('activeLink');
      } else {
        document.getElementById('userArrow')!.className = 'arrow down';
        document.getElementById('selectUserDropdown')!.style.height = '0px';
        // document.getElementById('userLinkContainer')!.classList.remove('activeLink');
      }
    } catch (error) {}
  }

  navigateToInProgressRound() {
    this.router.navigate(['/round/in-progress', this.scoreData.id]);
    setTimeout(() => {
      this.scoreService.inProgressScoreData.next(this.scoreData);
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile', 'rounds', this.userData.id]);
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
