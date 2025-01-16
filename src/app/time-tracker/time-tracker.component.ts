import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DefaultService } from '../Services/defaultGets.service';
import { SelectChangeEvent } from 'primeng/select';
import { HttpClient } from '@angular/common/http';
import { Projects, Tasks } from '../modals/modal';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../shared/shared.module';
import { NavbarComponent } from '../common/navbar/navbar.component';

@Component({
  selector: 'app-time-tracker',
  imports: [
    NavbarComponent,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './time-tracker.component.html',
  styleUrl: './time-tracker.component.scss',
  providers: [MessageService]
})
export class TimeTrackerComponent implements OnInit {
  taskss: any[] = [{ clone: '', t_name: '', start_time: 0, end_time: 0, totalTime: 0, description: '' }];
  dates: Date = new Date
  maxDate: Date | undefined;
  id!: number;
  clients: { c_name: string, id: number }[] = []
  selectedClients: string = ''

  projects: { p_name: string, id: number }[] = []
  selectedprojects: string = ''

  tasks: { t_name: string, id: number, p_id?: number }[] = []
  selectedtasks: string = ''
  disableClone: boolean = false;

  constructor(private getServices: DefaultService, private httpClient: HttpClient, private messageService: MessageService, private ngZone: NgZone) { }
  getProjects(number: SelectChangeEvent) {
    this.selectedClients = number.value.c_name
    const url = `http://localhost:3000/projects?c_id=${number.value.id}`
    this.httpClient.get<Projects[]>(url).subscribe(
      (res) => {
        this.projects = res
      }
    )
    this.disableClone = true
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
    this.disableClone = true
  }

  getTaskName(number: SelectChangeEvent) {
    this.selectedtasks = number.value.t_name
  }

  logs() {
    const transformedTasks = this.taskss.map((task) => {
      const taskName = typeof task.t_name === 'object' ? task.t_name.t_name : task.t_name;
      const startTime = task.start_time ? new Date(task.start_time).getTime() : 0;
      const endTime = task.end_time ? new Date(task.end_time).getTime() : 0;
      const totalTimeInMs = endTime - startTime;
      const hours = Math.floor(totalTimeInMs / 3600000);
      const minutes = Math.floor((totalTimeInMs % 3600000) / 60000);
      const seconds = Math.floor((totalTimeInMs % 60000) / 1000);
      const formattedTotalTime = `${hours}hr ${minutes}min ${seconds}sec`;
      return {
        t_name: taskName,
        start_time: startTime,
        end_time: endTime,
        totalTime: formattedTotalTime,
        description: task.description
      };
    });
    this.taskss.push(transformedTasks)
    const url = `http://localhost:3000/logs`
    const requesbody = {
      u_id: this.id,
      date: this.formatDate(this.dates),
      c_name: this.selectedClients,
      p_name: this.selectedprojects,
      tasks: transformedTasks
    }
    this.httpClient.post(url, requesbody).subscribe(
      (res) => {
        console.log(res);
        this.disableClone = false
      }
    )
  }

  MAX_TASK_TIME = 9 * 3600000;
  totalElapsedTime = 0;
  sharedProgress = 0;

  calculateTotalTime(task: any) {
    if (task.start_time && task.end_time) {
      const startTime = new Date(task.start_time).getTime();
      const endTime = new Date(task.end_time).getTime();

      if (endTime > startTime) {
        const elapsedTimeInMs = endTime - startTime;
        if (task.previousElapsedTime) {
          this.totalElapsedTime -= task.previousElapsedTime;
        }
        if (this.totalElapsedTime + elapsedTimeInMs > this.MAX_TASK_TIME) {
          this.messageService.add({
            severity: 'error',
            summary: 'Limit Exceeded',
            detail: `Cannot add time. Total time exceeds the 9-hour limit.`,
          });
          task.totalTime = "Exceeds limit";
          task.displayedTime = "Exceeds limit";
          return;
        }
        const hours = Math.floor(elapsedTimeInMs / 3600000);
        const minutes = Math.floor((elapsedTimeInMs % 3600000) / 60000);
        const seconds = Math.floor((elapsedTimeInMs % 60000) / 1000);

        task.totalTime = `${hours}hr ${minutes}min ${seconds}sec`;
        task.displayedTime = task.totalTime;
        this.totalElapsedTime += elapsedTimeInMs;
        task.previousElapsedTime = elapsedTimeInMs;
        this.updateSharedProgress();
      } else {
        task.totalTime = "Invalid time range";
        task.displayedTime = "Invalid time range";
      }
    }
  }

  updateSharedProgress() {
    const cappedTimeInMs = Math.min(this.totalElapsedTime, this.MAX_TASK_TIME);
    this.sharedProgress = (cappedTimeInMs / this.MAX_TASK_TIME) * 100;
    if (this.sharedProgress >= 100) {
      this.sharedProgress = 100;
      this.messageService.add({
        severity: 'info',
        summary: 'Success',
        detail: 'Reached the maximum allowed time (9 hours).',
      });
    }
  }

  formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${hours}hr ${minutes}min`;
  }

  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Disabled! Please select clients and projects', life: 2000 });
  }

  cloneData(data: any) {
    const clonedRow = { ...data }
    this.taskss.push(clonedRow)
    if (this.selectedClients && this.selectedprojects) {
      this.disableClone = false
      this.showError()
    }
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
        // this.getLogs()
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

}
