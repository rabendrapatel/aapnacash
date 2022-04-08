import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Constant } from 'src/app/constant/constant';
import { HttpService } from 'src/app/services/http.service';
import { getKeyValue, getObjKeyVal, validateFormFields } from 'src/app/shared/function/function';
import { ReqMethod } from 'src/app/shared/function/method';

@Component({
  selector: 'app-city-creation',
  templateUrl: './city-creation.component.html',
  styleUrls: ['./city-creation.component.scss']
})
export class CityCreationComponent implements OnInit {
  
  public createForm: FormGroup;
  public rowData = new Object();
  public loadingText: string;

  constructor(
    public formBuilder: FormBuilder,
    public ref: DynamicDialogRef, 
    public toastr: ToastrService,
    public config: DynamicDialogConfig,
    private spinner: NgxSpinnerService,
    public httpService: HttpService,
  ) {
      this.rowData = config.data;
   }

  ngOnInit(): void {
    this.initilizeForm();
  }

  initilizeForm() {
    this.createForm = this.formBuilder.group({
      stateId: [getObjKeyVal(this.rowData,'stateId',0)],
      stateName: [getObjKeyVal(this.rowData,'stateName','')],
      cityName: ['', Validators.required],
    });
  }

  saveNewCity(){
    if (this.createForm.invalid) {
      validateFormFields(this.createForm);
      return;
    }

    this.loadingText = "Saving data. Please wait...";
    this.spinner.show("main-spiner");

    let creationForm = this.createForm.value;

    let data = {
      stateId : getObjKeyVal(creationForm,'stateId',0),
      cityName: getObjKeyVal(creationForm,'cityName',''),
    }

    let url = "/api/v1/master/save/new/city";
    this.httpService.callAuthApi(url,data,ReqMethod.POST)
      .subscribe(data => {
            this.spinner.hide("main-spiner");
            if(data.respCode==Constant.respCode200){
              this.toastr.success(data.respDescription);
              this.ref.close(this.rowData);
            } else {
                this.toastr.error(data.respDescription);
            }
      },(err: HttpErrorResponse) => {
          this.spinner.hide ("main-spiner");
          if (err.error instanceof Error) {
              this.toastr.error('Client side error', 'Client error', {timeOut: 3000});
          } else {
              this.toastr.error('Server side error', 'Server error', {timeOut: 3000});
          }
      });
  }

}
