import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { getColorWhite, getRGB } from 'src/app/utilities/functions';

@Component({
  selector: 'app-aggregate-select',
  templateUrl: './aggregate-select.component.html',
  styleUrls: ['./aggregate-select.component.scss'],
})
export class AggregateSelectComponent {
  subscriptions: Subscription = new Subscription();
  @Input() id!: string;
  @Input() whiteEvent!: Observable<any>;
  @Input() data: any;
  @Output() onSubmitInput: EventEmitter<any> = new EventEmitter();
  showField: boolean = true;
  editing: boolean = false;
  idSelected!: string;
  teeSelected: any;
  displayValue!: string;
  tee1: any;
  tee2: any;
  isWhite: boolean = false;

  constructor(private courseService: CourseDetailsService) {}

  ngOnInit() {
    for (let tee of this.data.courseData.scorecard) {
      if (this.data.teeData.Tee1 == tee.id) this.tee1 = tee;
      if (this.data.teeData.Tee2 == tee.id) this.tee2 = tee;
    }

    // set value of this input from database
    try {
      if (this.data.teeData['A' + this.id] == this.tee1.id)
        this.teeSelected = this.tee1;
      else if (this.data.teeData['A' + this.id] == this.tee2.id)
        this.teeSelected = this.tee2;
      this.displayValue = this.teeSelected['H' + this.id];
      this.showField = false;
    } catch (error) {}

    this.isWhite = getColorWhite(getRGB(this.teeSelected?.Color));

    this.subscriptions.add(
      this.courseService.editingScoreCard.asObservable().subscribe((value) => {
        this.editing = value;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  submitValue() {
    this.showField = false;
    if (this.idSelected == this.tee1.id) this.teeSelected = this.tee1;
    else this.teeSelected = this.tee2;
    this.displayValue = this.teeSelected['H' + this.id];

    this.isWhite = getColorWhite(getRGB(this.teeSelected.Color));
    this.onSubmitInput.emit({
      id: [this.data.teeData.id, 'A' + this.id],
      value: this.teeSelected.id,
    });
  }
}
