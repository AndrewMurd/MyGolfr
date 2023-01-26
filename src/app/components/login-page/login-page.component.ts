import { Component } from '@angular/core';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  ngOnInit() {
    let input_element = document.querySelector("input");

    input_element!.addEventListener("keyup", () => {
        input_element!.setAttribute("value", input_element!.value);
    });
  }
}
