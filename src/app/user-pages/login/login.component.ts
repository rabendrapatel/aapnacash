import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/constant/constant';
import { validateFormFields } from 'src/app/shared/function/function';
import { FormControl } from '@angular/forms'
import { HttpService } from 'src/app/services/http.service';
import { ReqMethod } from 'src/app/shared/function/method';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public loadingText: string;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.initilizeForm();
  }


  initilizeForm() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }


  doLogin() {
    if (this.loginForm.invalid) {
      validateFormFields(this.loginForm);
      return;
    }

    this.loadingText = "Authenticating . Please wait...";
    this.spinner.show("main-spiner");
    let loginForm = this.loginForm.value;

    let request = {
      userName: loginForm.userName,
      password: loginForm.password
    }

    let url = "/api/v1/auth/login/via/password";
    this.httpService.callApi(url, request, ReqMethod.POST)
      .subscribe(data => {

        this.spinner.hide("main-spiner");
        if (data.respCode == Constant.respCode200) {
          this.toastr.success(data.respDescription);

          let loginDetails = data.payload;
          localStorage.setItem('isLogin', 'true');
          localStorage.setItem('loginDetails', JSON.stringify(loginDetails));
          this.getUserDetailsByAccessToken();

        } else {
          this.toastr.error(data.respDescription);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide("main-spiner");
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }

  getUserDetailsByAccessToken() {
    let request = {}
    let url = "/api/v1/user/get/user/details";
    this.httpService.callAuthApi(url, {}, ReqMethod.GET)
      .subscribe(data => {
        console.log(data)
        if (data.respCode == Constant.respCode200) {
          let res = data.payload;
          let userData = {};
          userData['id'] = res.id;
          userData['name'] = res.name;
          userData['mobile'] = res.mobile;
          userData['email'] = res.email;
          userData['userPhoto'] = res.userPhoto;
          userData['roleId'] = res["roleId"]["id"];
          userData['roleName'] = res["roleId"]["roleName"];
          userData['permission'] = res["permission"]["permission"];
          localStorage.setItem('userDetails', JSON.stringify(userData))
        } else {
          this.toastr.error(data.respMessage);
        }

        this.router.navigate(['transaction/dashboard']);
      }, (err: HttpErrorResponse) => {
        this.spinner.hide("main-spiner");
        if (err.error instanceof Error) {
          this.toastr.error('Client side error', 'Client error', { timeOut: 3000 });
        } else {
          this.toastr.error('Server side error', 'Server error', { timeOut: 3000 });
        }
      });
  }


}
