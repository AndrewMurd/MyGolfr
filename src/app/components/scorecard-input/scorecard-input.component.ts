import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-scorecard-input',
  templateUrl: './scorecard-input.component.html',
  styleUrls: ['./scorecard-input.component.scss']
})

export class ScorecardInputComponent {
  @Input() id!: string;
  @Input() width: string = '85%';
  @Input() placeholder!: string;
  @Output() onSubmitInput: EventEmitter<any> = new EventEmitter;
  showField: boolean = true;
  value!: string;
  teeColor!: string;

  submit(): void {
    if (!this.value) {
      alert('Must enter value!');
      return;
    }

    this.showField = false;
    let arrId = this.id.split(',');
    
    this.onSubmitInput.emit({id: arrId, value: this.value});

    // if (arrId = [1, 0]) {
    //   console.log(this.value);
    // }
  }
}
