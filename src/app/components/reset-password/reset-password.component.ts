import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  error!: string;
  password: string = '';
  confirmPass: string = '';
  btn: any;
  passwordError: any;
  passwordInput: any;
  confirmError: any;
  confirmInput: any;
  token!: string;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      try {
        this.token = params['token'];
      } catch (error) {}
    });
    this.btn = document.querySelector('#buttonResetPassword');
    this.passwordError = document.querySelector('#passwordResetPasswordError');
    this.passwordInput = <HTMLInputElement>(
      document.querySelector('#passwordResetPassword')
    );
    this.confirmError = document.querySelector('#confirmResetPasswordError');
    this.confirmInput = <HTMLInputElement>(
      document.querySelector('#confirmResetPassword')
    );

    this.passwordInput!.addEventListener('keyup', () => {
      this.passwordInput!.setAttribute('value', this.passwordInput.value);
    });
    this.confirmInput!.addEventListener('keyup', () => {
      this.confirmInput!.setAttribute('value', this.confirmInput.value);
    });
  }

  async onSubmit() {
    this.resetInnerText();
    this.resetInputClass();
    try {
      this.resetInnerText();
      this.resetInputClass();
      await this.userService.resetPassword(
        this.password,
        this.confirmPass,
        this.token
      );
      this.btn!.classList.remove('onclic');
      this.btn!.classList.add('validate');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    } catch (error: any) {
      if (error.error.errors) this.error = error.error.errors[0].param;
      const err = error.error;
      if (this.error == 'password') {
        this.passwordInput.classList.add('inputError');
        this.passwordError.innerText = error.error.errors[0].msg;
        this.btn!.classList.remove('onclic');
      } else if (this.error == 'confirmPass') {
        this.confirmInput.classList.add('inputError');
        this.confirmError.innerText = error.error.errors[0].msg;
        this.btn!.classList.remove('onclic');
      } else if (err.type == 'token') {
        this.alertService.alert('This session is invalid', {
          color: 'green',
          content: 'Accept',
        });
        this.router.navigate(['/login']);
      } else if (err.type == 'expired') {
        this.alertService.alert(
          'This session has expired, send another email and try again :)',
          { color: 'green', content: 'Accept' }
        );
        this.router.navigate(['/login']);
      } else {
        this.alertService.alert(
          'The server is having some problems please try again',
          { color: 'green', content: 'Accept' }
        );
      }
    }
  }

  onClick() {
    this.btn.classList.add('onclic');
  }

  resetInnerText() {
    this.error = '';
    this.passwordError.innerText = '';
    this.confirmError.innerText = '';
  }

  resetInputClass() {
    this.passwordInput.classList.remove('inputError');
    this.confirmInput.classList.remove('inputError');
  }
}
