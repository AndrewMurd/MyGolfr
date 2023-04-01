import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { AuthenticationService } from '../services/authentication.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { UserService } from '../services/user.service';

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
  showAccount: boolean = false;
  showOtherInfo: boolean = false;
  initialHeight: number = 270;
  height: number = this.initialHeight;
  userData: any;
  editName: boolean = false;
  editEmail: boolean = false;
  editPassword: boolean = false;
  error: string = '';
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
        this.editName = false;
        this.editEmail = false;
        this.editPassword = false;
        this.btnOpen = false;
        this.height = this.initialHeight;
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

    this.btn = document.querySelector('#buttonAccount');
    this.nameError = document.querySelector('#nameErrorAccount');
    this.emailError = document.querySelector('#emailErrorAccount');
    this.passwordError = document.querySelector('#passwordErrorAccount');
    this.confirmPassError = document.querySelector('#confirmPassErrorAccount');
    this.nameInput = document.querySelector('#nameInputAccount');
    this.emailInput = document.querySelector('#emailInputAccount');
    this.passwordInput = document.querySelector('#passwordInputAccount');
    this.confirmPassInput = document.querySelector('#confirmPassInputAccount');

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
  }

  ngAfterViewInit() {
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
    this.error = '';
    this.resetInnerText();
    this.resetInputClass();

    if (this.editName) {
      try {
        this.userData.name = this.name.replace(/ /g, '');
        await this.userService.updateName(this.userData.name, this.userData.id);
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
        console.log(error);
        this.error = error.error.errors[0].param;
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
        this.error = error.error.errors[0].param;
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
        this.error = error.error.errors[0].param;
        if (this.error == 'password') {
          this.passwordInput.classList.add('inputError');
          this.passwordError.innerText = error.error.errors[0].msg;
        } else if (this.error == 'confirmPass') {
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
  }

  resetInputClass() {
    this.nameInput.classList.remove('inputError');
    this.emailInput.classList.remove('inputError');
    this.passwordInput.classList.remove('inputError');
    this.confirmPassInput.classList.remove('inputError');
  }

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
