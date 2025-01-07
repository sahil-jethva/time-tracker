import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
interface City {
  name: string,
  code: string
}
@Component({
  selector: 'app-time-tracker',
  imports: [NavbarComponent, DialogModule, ButtonModule, InputTextModule,
    FloatLabel,
    CardModule,
    MultiSelectModule,
    FormsModule
  ],
  standalone: true,
  templateUrl: './time-tracker.component.html',
  styleUrl: './time-tracker.component.scss'
})
export class TimeTrackerComponent implements OnInit {
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  cities!: City[];

  selectedCities!: City[];

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];
  }
}
