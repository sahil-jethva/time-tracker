import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MegaMenuModule } from 'primeng/megamenu';


const PRIME_NG_SHARED_MODULES = [
  ButtonModule,
  AvatarModule,
  StepsModule,
  CardModule,
  InputTextModule,
  DropdownModule,
  TooltipModule,
  RippleModule,
  DialogModule,
  ConfirmDialogModule,
  CheckboxModule,
  InputNumberModule,
  InputMaskModule,
  CalendarModule,
  TableModule,
  MultiSelectModule,
  ProgressBarModule,
  KeyFilterModule,
  PasswordModule,
  ChipModule,
  SelectButtonModule,
  InputSwitchModule,
  ToggleButtonModule,
  InputGroupModule,
  SelectModule,
  DatePickerModule,
  ToastModule,
  MegaMenuModule
];


const SHARED_MODULES = [
  ...PRIME_NG_SHARED_MODULES,
];



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...SHARED_MODULES
  ],
  exports: [
  ...SHARED_MODULES
  ],
  providers:[]
})
export class SharedModule { }
