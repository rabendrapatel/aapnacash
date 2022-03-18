import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { InplaceModule} from 'primeng/inplace';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr'
import { ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angular2-qrcode';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { TreeviewModule } from 'ngx-treeview';
import { MatRadioModule } from '@angular/material/radio';

import { DashboardComponent } from '../dashboard/dashboard.component';
import { UnauthorizedComponent } from './Error/unauthorized/unauthorized.component';
import { EmployeeCreationComponent } from './Master/employee/employee-creation/employee-creation.component';
import { EmployeeListComponent } from './Master/employee/employee-list/employee-list.component';
import { EmployeeModificationComponent } from './Master/employee/employee-modification/employee-modification.component';
import { ChangePasswordComponent } from './Transaction/utility/change-password/change-password.component';

import { RoleCreationComponent } from './Master/role/role-creation/role-creation.component';
import { RoleModificationComponent } from './Master/role/role-modification/role-modification.component';
import { RoleListComponent } from './Master/role/role-list/role-list.component';


/* Vender Transaction Routing **/
import { DynamicFieldComponent } from './Transaction/dynamic-field/dynamic-field.component';
import { SearchCustomerComponent } from './Transaction/crm/encashment/search-customer/search-customer.component';
import { TransferToFfmcComponent } from './Transaction/crm/encashment/transfer-to-ffmc/transfer-to-ffmc.component';

import { DoEncahsmentComponent } from './Transaction/crm/encashment/do-encahsment/do-encahsment.component';
import { EncashmentListComponent } from './Transaction/crm/encashment/encashment-list/encashment-list.component';
import { ModifyEncashmentComponent } from './Transaction/crm/encashment/modify-encashment/modify-encashment.component';


const routes: Routes = [
  { path: 'dashboard',component: DashboardComponent},
  { path: 'unauthorized',component: UnauthorizedComponent},

  { path: 'employeecreation', component: EmployeeCreationComponent },
  { path: 'employeelist', component: EmployeeListComponent },
  { path: 'employeemodification', component: EmployeeModificationComponent },
  { path: 'changepassword', component: ChangePasswordComponent },

  { path: 'rolecreation', component: RoleCreationComponent },
  { path: 'rolelist', component: RoleListComponent },

  { path: 'searchcustomer', component: SearchCustomerComponent },
  { path: 'transfertoffmc', component: TransferToFfmcComponent },

  { path: 'doencashment', component: DoEncahsmentComponent },
  { path: 'encashmentlist', component: EncashmentListComponent },
  { path: 'modifyencashment', component: ModifyEncashmentComponent },

  /* Transaction Routing * */
  { path: 'dynamicfield', component: DynamicFieldComponent },
];


@NgModule({
  declarations: [
    EmployeeCreationComponent,
    EmployeeListComponent,
    EmployeeModificationComponent,
    DynamicFieldComponent,
    RoleCreationComponent,
    RoleModificationComponent,
    RoleListComponent,
    ChangePasswordComponent,
    UnauthorizedComponent,
    SearchCustomerComponent,
    TransferToFfmcComponent,
    DoEncahsmentComponent,
    EncashmentListComponent,
    ModifyEncashmentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes,),
    TabViewModule,
    ButtonModule,
    DropdownModule,
    FileUploadModule,
    TableModule,
    FormsModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    MatFormFieldModule,
    CalendarModule,
    KeyFilterModule,
    MultiSelectModule,
    TriStateCheckboxModule,
    RadioButtonModule,
    NgbModule,
    CheckboxModule,
    QRCodeModule,
    ContextMenuModule,
    InplaceModule,
    ConfirmDialogModule,
    ToggleButtonModule,
    InputTextareaModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatTreeModule,
    TreeviewModule.forRoot(),
    MatRadioModule,
    DialogModule,
  ],
  providers:[DatePipe]
})
export class TransactionModule { }
