import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validateDynamicFormFields } from 'src/app/shared/function/function';

@Component({
  selector: 'app-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss']
})
export class DynamicFieldComponent implements OnInit {

  public creationForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
      this.initilizeForm();
  }

  get f() { return this.creationForm.controls; }
  get t() { return this.f.fields as FormArray; }

  initilizeForm(){
    this.creationForm = this.formBuilder.group({
      fields: new FormArray([])
    });

    for (let i = 0; i < 2; i++) {
      this.t.push(this.formBuilder.group({
          name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
      }));
    }
  }

  addRow(row){
    this.t.push(this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
    }));
  }

  removeRow(row){
    if(this.t.length>1)
    this.t.removeAt(row);
  }


  onSubmit() {
      validateDynamicFormFields(this.creationForm,'fields');
      if (this.creationForm.invalid) {
        return;
      }
      console.log(JSON.stringify(this.creationForm.value, null, 4));
  }


}
