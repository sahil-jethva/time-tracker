import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DefaultService } from '../Services/defaultGets.service';
import { Select, SelectChangeEvent } from 'primeng/select';
import { HttpClient } from '@angular/common/http';
import { Projects, Tasks } from '../modals/modal';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DatePicker } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
interface City {
  name: string,
  code: string
}
@Component({
  selector: 'app-time-tracker',
  imports: [NavbarComponent,
    DialogModule, ButtonModule, InputTextModule,
    CardModule,
    MultiSelectModule,
    Select,
    TableModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    DatePicker,
    DatePipe,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule
  ],
  standalone: true,
  templateUrl: './time-tracker.component.html',
  styleUrl: './time-tracker.component.scss'
})
export class TimeTrackerComponent implements OnInit {
  taskss: any[] = [{ t_name: '', start_time: '', end_time: '', totaltime: '', description: '' }];

  startTime: string | null = null
  endTime: string | null = null
  totalTime: string | null =null
  description: string = ''

  dates: Date = new Date
  maxDate: Date | undefined;
  id!: number;
  clients: { c_name: string, id: number }[] = []
  selectedClients:string = ''

  projects: { p_name: string, id: number }[] = []
  selectedprojects: string= ''

  tasks: { t_name: string, id: number }[] = []
  selectedtasks: string = ''


  constructor(private getServices: DefaultService, private httpClient: HttpClient) { }
  getProjects(number: SelectChangeEvent) {
    this.selectedClients = number.value.c_name
    const url = `http://localhost:3000/projects?c_id=${number.value.id}`
    this.httpClient.get<Projects[]>(url).subscribe(
      (res) => {
        this.projects = res
      }
    )

  }
  getTasks(number: SelectChangeEvent) {
    this.selectedprojects = number.value.p_name
    const url = `http://localhost:3000/tasks?p_id=${number.value.id}`
    this.httpClient.get<Tasks[]>(url).subscribe(
      (res) => {
        this.tasks = res
        console.log(res);

      }
    )
  }

  getTaskName(number: SelectChangeEvent) {
    this.selectedtasks = number.value.t_name
  }

  newTasks:any[]=[]
  logs() {
    const newTask = {
      t_name: this.selectedtasks,
      start_time: this.startTime? new Date(this.startTime).getTime(): null,
      end_time: this.endTime ? new Date(this.endTime).getTime() : null,
      description: this.description
    }
    this.newTasks.push(newTask)
    const url = `http://localhost:3000/logs`
    const requesbody = {
      u_id: this.id,
      date:this.formatDate(this.dates),
      c_name: this.selectedClients,
      p_name: this.selectedprojects,
      tasks:this.newTasks
    }
    this.httpClient.post(url, requesbody).subscribe(
      (res) => {
        console.log(res);
      }
    )
  }
  ngOnInit() {
    this.getServices.getCLient().subscribe(
      (res) => {
        this.clients = res
      }
    )
    this.getServices.getMe().subscribe(
      (res) => {
        this.id = res.user.id
      }
    )
    let today = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(today.getDate() + 3);
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }
  updateTotalTime() {
    if (this.startTime && this.endTime) {
      const startMillis = new Date(this.startTime).getTime();
      const endMillis = new Date(this.endTime).getTime();
      this.totalTime = this.calculateTotalTime(startMillis, endMillis);
    } else {
      this.totalTime = null;
    }
  }
  calculateTotalTime(startMillis: number, endMillis: number): string {
    const diffMillis = endMillis - startMillis;

    const hours = Math.floor(diffMillis / (1000 * 60 * 60));
    const minutes = Math.floor((diffMillis % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMillis % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }
  // addTask() {
  //   if (this.newTask.t_name && this.newTask.start_time && this.newTask.end_time) {
  //     // Calculate total time
  //     const startMillis = new Date(this.newTask.start_time).getTime();
  //     const endMillis = new Date(this.newTask.end_time).getTime();

  //     if (startMillis && endMillis && endMillis > startMillis) {
  //       this.newTask.totaltime = this.calculateTotalTime(startMillis, endMillis);
  //     } else {
  //       this.newTask.totaltime = 'Invalid time range';
  //     }

  //     // Push the new task to the array
  //     this.tasks.push({ ...this.newTask }); // Spread operator to avoid reference issues

  //     // Reset the newTask object for the next input
  //     this.newTask = { t_name: '', start_time: '', end_time: '', totaltime: '', description:'' };
  //   } else {
  //     alert('Please fill in all the fields before adding a new task.');
  //   }
  // }
}
