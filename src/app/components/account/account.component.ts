import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { AuthenticationService } from '../../services/authentication.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { makeid } from 'src/app/utilities/functions';

// this component is used for displaying and editing logged in users account info
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: [
    trigger('openCloseAccount', [
      state(
        'open',
        style({
          height: '270px',
          width: '100vw',
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          width: '0px',
          border: 'none',
        })
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
    trigger('openCloseRow', [
      state(
        'open',
        style({
          transform: 'translateX(0px)',
        })
      ),
      state(
        'closed',
        style({
          transform: 'translateX(-400px)',
        })
      ),
      transition('open => closed', [animate('0.35s')]),
      transition('closed => open', [animate('0.35s')]),
    ]),
  ],
})
export class AccountComponent {
  subscriptions: Subscription = new Subscription();
  @Input() showAccountObs!: Observable<any>;
  uniqueId: string = makeid(5);
  showAccount: boolean = false;
  showOtherInfo: boolean = false;
  initialHeight: number = 270;
  height: number = this.initialHeight;
  userData: any;
  editName: boolean = false;
  editEmail: boolean = false;
  editPassword: boolean = false;
  errorName: boolean = false;
  errorEmail: boolean = false;
  errorPassword: boolean = false;
  errorConfirmPass: boolean = false;
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPass: string = '';
  btn: any;
  nameError: any;
  emailError: any;
  passwordError: any;
  confirmPassError: any;
  nameInput: any;
  emailInput: any;
  passwordInput: any;
  confirmPassInput: any;
  eyeSrc: boolean = false;
  btnOpen: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.showAccountObs.subscribe((value) => {
        this.showAccount = value;
        // reset variables when opening account info component
        this.editName = false;
        this.editEmail = false;
        this.editPassword = false;
        this.btnOpen = false;
        this.height = this.initialHeight;
        // delaying displaying info until animation is done
        if (value == false) {
          this.showOtherInfo = value;
          return;
        } else {
          setTimeout(() => {
            this.showOtherInfo = value;
          }, 200);
        }
      })
    );
  }

  ngAfterViewInit() {
    this.btn = document.getElementById('buttonAccount' + this.uniqueId);
    this.nameError = document.getElementById(
      'nameErrorAccount' + this.uniqueId
    );
    this.emailError = document.getElementById(
      'emailErrorAccount' + this.uniqueId
    );
    this.passwordError = document.getElementById(
      'passwordErrorAccount' + this.uniqueId
    );
    this.confirmPassError = document.getElementById(
      'confirmPassErrorAccount' + this.uniqueId
    );
    this.nameInput = document.getElementById(
      'nameInputAccount' + this.uniqueId
    );
    this.emailInput = document.getElementById(
      'emailInputAccount' + this.uniqueId
    );
    this.passwordInput = document.getElementById(
      'passwordInputAccount' + this.uniqueId
    );
    this.confirmPassInput = document.getElementById(
      'confirmPassInputAccount' + this.uniqueId
    );

    // move placeholder text to top of input when there is value
    this.nameInput.addEventListener('keyup', () => {
      this.nameInput.setAttribute('value', this.nameInput.value);
    });
    this.emailInput.addEventListener('keyup', () => {
      this.emailInput.setAttribute('value', this.emailInput.value);
    });
    this.passwordInput.addEventListener('keyup', () => {
      this.passwordInput.setAttribute('value', this.passwordInput.value);
    });
    this.confirmPassInput.addEventListener('keyup', () => {
      this.confirmPassInput.setAttribute('value', this.confirmPassInput.value);
    });

    this.subscriptions.add(
      this.authService.user.asObservable().subscribe((value) => {
        if (value) {
          this.userData = value;
          this.name = this.userData.name;
          this.email = this.userData.email;
          this.nameInput.setAttribute('value', this.name);
          this.emailInput.setAttribute('value', this.email);
        }
      })
    );
  }

  async onSubmit() {
    this.resetInnerText();
    this.resetInputClass();

    if (this.editName) {
      try {
        // remove whitespace
        this.userData.name = this.name.replace(/ /g, '');
        await this.userService.updateName(this.userData.name, this.userData.id);
        // set btn class to validate and reset inputs
        this.btn.classList.remove('onclic');
        this.btn.classList.add('validate');
        this.resetInnerText();
        this.resetInputClass();
        this.editName = false;
        setTimeout(() => {
          this.btn.classList.remove('validate');
          this.openBtn();
        }, 800);
      } catch (error: any) {
        // set error
        this.errorName = true;
        this.nameInput.classList.add('inputError');
        this.nameError.innerText = error.error.errors[0].msg;
        setTimeout(() => {
          this.btn.classList.remove('onclic');
        }, 800);
      }
    }
    if (this.editEmail) {
      try {
        this.userData.email = this.email;
        await this.userService.updateEmail(this.email, this.userData.id);
        this.btn.classList.remove('onclic');
        this.btn.classList.add('validate');
        this.resetInnerText();
        this.resetInputClass();
        this.editEmail = false;
        setTimeout(() => {
          this.btn.classList.remove('validate');
          this.openBtn();
        }, 800);
      } catch (error: any) {
        this.errorEmail = true;
        this.emailInput.classList.add('inputError');
        this.emailError.innerText = error.error.errors[0].msg;
        setTimeout(() => {
          this.btn.classList.remove('onclic');
        }, 800);
      }
    }
    if (this.editPassword) {
      try {
        await this.userService.updatePassword(
          this.password,
          this.confirmPass,
          this.userData.id
        );
        this.btn.classList.remove('onclic');
        this.btn.classList.add('validate');
        this.resetInnerText();
        this.resetInputClass();
        this.editPassword = false;
        this.openBtn();
        setTimeout(() => {
          this.btn.classList.remove('validate');
          this.height -= 80;
        }, 800);
      } catch (error: any) {
        if (error.error.errors[0].param == 'password') {
          this.errorPassword = true;
          this.passwordInput.classList.add('inputError');
          this.passwordError.innerText = error.error.errors[0].msg;
        } else if (error.error.errors[0].param == 'confirmPass') {
          this.errorConfirmPass = true;
          this.passwordInput.classList.add('inputError');
          this.confirmPassInput.classList.add('inputError');
          this.confirmPassError.innerText = error.error.errors[0].msg;
        }
        setTimeout(() => {
          this.btn.classList.remove('onclic');
        }, 800);
      }
    }
  }

  // adds or removes height to account info page based on what user is editing
  openBtn() {
    const factor = 65;
    if (
      (this.editEmail || this.editName || this.editPassword) &&
      !this.btnOpen
    ) {
      this.height = this.height + factor;
      this.btnOpen = true;
    } else if (
      !this.editEmail &&
      !this.editName &&
      !this.editPassword &&
      this.btnOpen
    ) {
      this.height = this.height - factor;
      this.btnOpen = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onClick() {
    this.btn.classList.add('onclic');
  }

  resetInnerText() {
    this.nameError.innerText = '';
    this.emailError.innerText = '';
    this.passwordError.innerText = '';
    this.confirmPassError.innerText = '';
    this.errorName = false;
    this.errorEmail = false;
    this.errorPassword = false;
    this.errorConfirmPass = false;
  }

  resetInputClass() {
    this.nameInput.classList.remove('inputError');
    this.emailInput.classList.remove('inputError');
    this.passwordInput.classList.remove('inputError');
    this.confirmPassInput.classList.remove('inputError');
  }

  // switch input type based on eye
  switchEye(ev: any) {
    ev.stopPropagation();
    this.eyeSrc = !this.eyeSrc;
    if (this.eyeSrc) {
      this.passwordInput.setAttribute('type', 'text');
      this.confirmPassInput.setAttribute('type', 'text');
    } else {
      this.passwordInput.setAttribute('type', 'password');
      this.confirmPassInput.setAttribute('type', 'password');
    }
  }
}
