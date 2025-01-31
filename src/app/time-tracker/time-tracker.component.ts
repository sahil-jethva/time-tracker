import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DefaultService } from '../Services/defaultGets.service';
import { SelectChangeEvent } from 'primeng/select';
import { HttpClient } from '@angular/common/http';
import { Projects, Tasks } from '../modals/modal';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../shared/shared.module';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { apiURL } from '../../env';

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
  taskss: any[] = [{ delete: '', clone: '',dates:'', c_name: '', p_name: '', t_name: '', start_time: 0, end_time: 0, totalTime: 0, description: '' }];
  dates: Date = new Date
  id!: number;
  clients: { c_name: string, id: number }[] = []
  selectedClients: string = ''

  projects: { p_name: string, id: number }[] = []
  selectedprojects: string = ''

  tasks: { t_name: string, id: number, p_id?: number }[] = []
  selectedtasks: string = ''

  MAX_TASK_TIME = 15 * 3600000;
  totalElapsedTime = 0;
  sharedProgress = 0;

  isManual: boolean = false

  constructor(private getServices: DefaultService, private httpClient: HttpClient, private messageService: MessageService) { }
  toggleManual() {
    this.isManual = !this.isManual;
  }
  getProjects(row: any) {
    const url = `${apiURL}/projects?c_id=${row.selectedClients.id}`
    this.httpClient.get<Projects[]>(url).subscribe(
      (res) => {
        row.projects = res
      }
    )
  }
  getTasks(row: any) {
    const url = `${ apiURL }/tasks?p_id=${row.selectedprojects.id}`
    this.httpClient.get<Tasks[]>(url).subscribe(
      (res) => {
        row.tasks = res
      }
    )
  }
  getTaskName(number: SelectChangeEvent) {
    this.selectedtasks = number.value.t_name
  }
  save() {
    const groupedTasks = this.taskss.reduce((acc, task) => {
      const date = this.formatDate(task.dates)
      const clientName = task.selectedClients?.c_name;
      const projectName = task.selectedprojects?.p_name;
      const key = `${clientName}_${projectName}_${date}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      const taskName = typeof task.selectedtasks?.t_name === 'object'
        ? task.selectedtasks?.t_name.t_name
        : task.selectedtasks?.t_name;

      const startTime = task.start_time ? new Date(task.start_time).getTime() : null;
      const endTime = task.end_time ? new Date(task.end_time).getTime() : null;

      let totalTime = '0hr 0min 0sec';
      if (startTime && endTime && endTime > startTime) {
        const totalTimeInMs = endTime - startTime;
        const hours = Math.floor(totalTimeInMs / 3600000);
        const minutes = Math.floor((totalTimeInMs % 3600000) / 60000);
        const seconds = Math.floor((totalTimeInMs % 60000) / 1000);
        totalTime = `${hours}hr ${minutes}min ${seconds}sec`;
      }
      acc[key].push({
        t_name: taskName,
        start_time: startTime,
        end_time: endTime,
        totalTime,
        description: task.description,
      });

      return acc;
    }, {});
    const requestBodies = Object.entries(groupedTasks).map(([key, tasks]) => {
      const [clientName, projectName, date] = key.split('_');
      return {
        u_id: this.id,
        date: date,
        c_name: clientName,
        p_name: projectName,
        tasks,
      };
    });
    const url = `${ apiURL }/logs`;
    requestBodies.forEach((requestBody) => {
      this.httpClient.post(url, requestBody).subscribe(
        (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Data for ${requestBody.c_name} - ${requestBody.p_name} saved successfully!`,
          });
        },
        (error) => {
          console.error('Error saving data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to save data for ${requestBody.c_name} - ${requestBody.p_name}!`,
          });
        }
      );
    });
    this.taskss = [{}]
  }

  calculateTotalTime(task: any) {
    if (task.start_time && task.end_time) {
      const startTime = new Date(task.start_time).getTime();
      const endTime = new Date(task.end_time).getTime();

      if (endTime <= startTime) {
        task.totalTime = "Invalid time range";
        task.displayedTime = "Invalid time range";
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Time',
          detail: `End time must be after start time.`,
        });
        return;
      }

      const elapsedTimeInMs = endTime - startTime;
      const previousTaskTime = task.previousElapsedTime || 0;
      const newTotalElapsedTime = this.totalElapsedTime - previousTaskTime + elapsedTimeInMs;

      if (newTotalElapsedTime > this.MAX_TASK_TIME) {
        this.messageService.add({
          severity: 'error',
          summary: 'Limit Exceeded',
          detail: `Cannot add time. Total time exceeds the 9-hour limit.`,
        });
        task.totalTime = "Exceeds limit";
        task.displayedTime = "Exceeds limit";
        return;
      }
      task.totalTime = this.formatTime(elapsedTimeInMs);
      task.displayedTime = task.totalTime;

      this.totalElapsedTime = newTotalElapsedTime;
      task.previousElapsedTime = elapsedTimeInMs;
      this.updateSharedProgress();
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

  addRow() {
    const clonedRow = {}
    this.taskss.push(clonedRow)
  }

  cloneData(data: any) {
    const clonedRow = {
      ...data,
      c_name: data.selectedClients?.c_name || data.c_name,
      p_name: data.selectedprojects?.p_name || data.p_name,
      t_name: data.selectedtasks?.t_name || data.t_name,
    };
    const lastTaskEndTime = this.taskss.length
      ? new Date(this.taskss[this.taskss.length - 1].end_time).getTime()
      : new Date().getTime();

    const newStartTime = new Date(lastTaskEndTime + 60);
    const newEndTime = new Date(newStartTime.getTime() + 3600000);
    if (this.totalElapsedTime + (newEndTime.getTime() - newStartTime.getTime()) > this.MAX_TASK_TIME) {
      this.messageService.add({
        severity: 'error',
        summary: 'Limit Exceeded',
        detail: `Cannot clone the row. Total time exceeds the 9-hour limit.`,
      });
      return;
    }
    clonedRow.start_time = newStartTime;
    clonedRow.end_time = newEndTime;
    clonedRow.totalTime = this.formatTime(newEndTime.getTime() - newStartTime.getTime());
    clonedRow.previousElapsedTime = newEndTime.getTime() - newStartTime.getTime();
    clonedRow.description = '';

    this.taskss.push(clonedRow);
    this.totalElapsedTime += newEndTime.getTime() - newStartTime.getTime();
    this.updateSharedProgress();
  }


  deleteRow(row: any) {
    this.taskss = this.taskss.filter((task) => task !== row);
    this.totalElapsedTime = 0;
    this.sharedProgress = 0;
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
  }

  // formatDate(date: Date): string {
  //   const day = date.getDate().toString().padStart(2, '0') ;
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${month}-${day}-${year}`;
  // }
  formatDate(date: any): string {
    const validDate = date instanceof Date ? date : new Date(date);
    if (isNaN(date?.getTime())) {
      return 'Select date';
    }
    const day = validDate.getDate().toString().padStart(2, '0');
    const month = (validDate.getMonth() + 1).toString().padStart(2, '0');
    const year = validDate.getFullYear();
    return `${month}-${day}-${year}`;
  }

  formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${hours}hr ${minutes}min`;
  }
  convertMillisecondsToTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }


  inter: any[] = [];
  isStart: boolean = true;
  isRunning: boolean = false;
  timer: any;
  elapsedTime: number = 0;
  startTime: Date | null = null;



  startTimer(rowData?: any) {
    if (rowData) {
      rowData.isStart = false;
      rowData.isRunning = true;
    }
    this.isStart = false;
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = new Date();
      this.elapsedTime = this.calculateElapsedTime(rowData);
      this.timer = setInterval(() => {
        this.elapsedTime += 1000;
      }, 1000);
    }
  }

  pauseTimer(rowData?: any) {
    if (rowData) {
      rowData.isStart = true;
      rowData.isRunning = false;
    }
    this.isStart = true;
    if (this.isRunning) {
      clearInterval(this.timer);
      this.isRunning = false;
      const currentEndTime = new Date();
      const sessionElapsedTime = currentEndTime.getTime() - this.startTime!.getTime();
      if (rowData) {
        rowData.end = currentEndTime;
        rowData.elapsed = this.formatTimes(this.elapsedTime + sessionElapsedTime);
      } else if (this.startTime) {
        this.inter.push({
          start: this.startTime,
          end: currentEndTime,
          elapsed: this.formatTimes(sessionElapsedTime),
          selectedClients: null,
          selectedProjects: null,
          selectedTasks: null,
          description: "",
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Time entry has been created!`,
          life: 2000
        });
      }
      this.elapsedTime = 0;
      this.startTime = null;
    }
  }


  addLog() {
    const groupedTasks = this.inter.reduce((acc, task) => {
      const date = this.formatDate(task.dates)
      const clientName = task.selectedClients?.c_name;
      const projectName = task.selectedprojects?.p_name;
      const key = `${clientName}_${projectName}_${date}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      const taskName = typeof task.selectedtasks?.t_name === 'object'
        ? task.selectedtasks?.t_name.t_name
        : task.selectedtasks?.t_name;

      const startTime = task.start ? new Date(task.start).getTime() : null;
      const endTime = task.end ? new Date(task.end).getTime() : null;

      let totalTime = '0hr 0min 0sec';
      if (startTime && endTime && endTime > startTime) {
        const totalTimeInMs = endTime - startTime;
        const hours = Math.floor(totalTimeInMs / 3600000);
        const minutes = Math.floor((totalTimeInMs % 3600000) / 60000);
        const seconds = Math.floor((totalTimeInMs % 60000) / 1000);
        totalTime = `${hours}hr ${minutes}min ${seconds}sec`;
      }
      acc[key].push({
        t_name: taskName,
        start_time: startTime,
        end_time: endTime,
        totalTime,
        description: task.description,
      });

      return acc;
    }, {});
    const requestBodies = Object.entries(groupedTasks).map(([key, tasks]) => {
      const [clientName, projectName, date] = key.split('_');
      return {
        u_id: this.id,
        date: date,
        c_name: clientName,
        p_name: projectName,
        tasks,
      };
    });
    const url = `${apiURL}/logs`;
    requestBodies.forEach((requestBody) => {
      this.httpClient.post(url, requestBody).subscribe(
        (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Data for ${requestBody.c_name} - ${requestBody.p_name} saved successfully!`,
          });
        },
        (error) => {
          console.error('Error saving data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to save data for ${requestBody.c_name} - ${requestBody.p_name}!`,
          });
        }
      );
    });
    this.inter = [{}]

  }

  calculateElapsedTime(rowData: any): number {
    const previousElapsedTime = this.parseTimeToMilliseconds(rowData?.elapsed);
    return previousElapsedTime;
  }

  parseTimeToMilliseconds(time: string): number {
    if (!time) return 0;
    const parts = time.split(':').map(Number);
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }

  formatTimes(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((milliseconds % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((milliseconds % 60000) / 1000).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

}
