import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DefaultService } from '../Services/defaultGets.service';
interface City {
  name: string,
  code: string
}
@Component({
  selector: 'app-time-tracker',
  imports: [NavbarComponent,
    DialogModule, ButtonModule, InputTextModule,
    FloatLabel,
    CardModule,
    MultiSelectModule,
    // ImportsModule,
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

  cities: {c_name:string,id:number}[] = []
  selectedClients: string[] = []

  selectedCities!: City[];
  constructor(private getServices:DefaultService){}

  ngOnInit() {
    this.getServices.getCLient().subscribe(
      (res) => {
        console.log(res);
        this.cities = res
      }
    )

  }
}
