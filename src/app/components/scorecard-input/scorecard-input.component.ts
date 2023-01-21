import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scorecard-input',
  templateUrl: './scorecard-input.component.html',
  styleUrls: ['./scorecard-input.component.scss']
})

export class ScorecardInputComponent {
  @Input() id!: string;
  showField: boolean = true;
  value!: string;
  teeColor!: string;

  submit(): void {
    this.showField = false;
    let arrId = this.id.split(',').map(Number);

    if (arrId = [1, 0]) {
      console.log(this.value);
    }
  }
}
