import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

// forgot password component that send email to user for password retrieval
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  error: boolean = false;
  email: string = '';
  btn: any;
  emailError: any;
  emailInput: any;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.btn = document.querySelector('#buttonForgotPassword');
    this.emailError = document.querySelector('#emailErrorForgotPassword');
    this.emailInput = <HTMLInputElement>document.querySelector('#emailInputForgotPassword');

    this.emailInput!.addEventListener('keyup', () => {
      this.emailInput!.setAttribute('value', this.emailInput.value);
    });
  }

  async onSubmit() {
    try {
      if (this.email == '') {
        this.error = true;
        this.emailError.innerText = 'Must enter an email';
        this.emailInput.classList.add('inputError');
        this.btn!.classList.remove('onclic');
        return;
      }
      this.error = false;
      this.resetInnerText();
      this.resetInputClass();
      await this.userService.forgotPassword(this.email);
      this.btn!.classList.remove('onclic');
      this.btn!.classList.add('validate');
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    } catch (error: any) {
      this.error = true;
      this.emailInput.classList.add('inputError');
      this.emailError.innerText = error.error.error;
      this.btn!.classList.remove('onclic');
    }
  }

  onClick() {
    this.btn.classList.add('onclic');
  }

  resetInnerText() {
    this.emailError.innerText = '';
  }

  resetInputClass() {
    this.emailInput.classList.remove('inputError');
  }
}
