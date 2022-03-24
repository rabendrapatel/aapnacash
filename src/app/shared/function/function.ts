import { FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

/* Match equal value  of reactive form*/
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}

/* Match equal value  of reactive form*/
export function LessMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value < matchingControl.value) {
      matchingControl.setErrors({ lessMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}

/* Compare from date must be less than to date*/
export function FromDateLessToDate(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.fromDateLessToDate) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value.year > matchingControl.value.year) {
      matchingControl.setErrors({ fromDateLessToDate: true });
    }
    else if (control.value.month > matchingControl.value.month) {
      matchingControl.setErrors({ fromDateLessToDate: true });
    }
    else if (control.value.day > matchingControl.value.day) {
      matchingControl.setErrors({ fromDateLessToDate: true });
    }
    else {
      matchingControl.setErrors(null);
    }
  }
}

/* Validate all required field of form*/
export function validateFormFields(formGroup: FormGroup) {
  let isInValid = false;
  Object.keys(formGroup.controls).forEach(field => {
    const control = formGroup.get(field);
    if (control instanceof FormControl) {
      control.markAsTouched({ onlySelf: true });
    }

    if (control.status == 'INVALID') {
      isInValid = true;
    }
  });

  return isInValid;
}

/* Validate all required field of dynamic form*/
export function validateDynamicFormFields(form: any, fieldName: string) {
  let isInValid = false;
  const formFieldArray = form.controls[fieldName].controls;
  for (const formGroup of formFieldArray) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      if (control.status == 'INVALID') {
        isInValid = true;
      }
    });
  }

  return isInValid;
}

/** Check value exists in json array */
export function checkInMultidimensionalArray(list, key, check) {
  let existsData = list.filter(function (item) {
    return item[key] == check;
  });
  if (typeof existsData !== 'undefined' && existsData.length > 0) {
    return false;
  } else {
    return true;
  }
}

/** Remove value form  json array */
export function removeFromMultidimensionalArray(list, key, removeValue) {
  let existsData = list.filter(function (item) {
    return item[key] !== removeValue;
  });
  return existsData;
}

/** Get key Data json array */
export function getKeyDataFromMultidimensionalArray(list, key, removeKey) {
  let existsData = list.filter(function (item) {
    return item[key] == removeKey;
  });
  return existsData;
}

/** GetTime from Date */
export function getTime(date, formate) {
  let options = { hour12: formate };
  let time = new Date(date).toLocaleTimeString('en-US', options);
  return time;
}

/** Get Fromated Date */
export function formateDate(dates) {
  if(dates==""){ return dates; }
  let date = new Date(dates);
  let mnth = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-");
}

export function getKeyFromObject(data, keyArray) {
  let res = new Object();
  keyArray.forEach(element => {
    res[element] = data[element];
  });
  return res;
}

export function removeKeyFromObject(data, keyArray) {
  keyArray.forEach(element => {
    delete data[element];
  });
  return data;
}

export function removeKeyFromJsonArray(data, keyArray) {
  keyArray.forEach(element => {
    data.forEach(element1 => {
      delete element1[element];
    });
  });
  return data;
}

export function getKeyValue(fomControl: any, key: string, field: string, noValue: any) {
  if (typeof fomControl[key] === 'object' && typeof(fomControl[key]) != "undefined" && fomControl[key] !== null) {
    return fomControl[key][field];
  }
  return noValue;
}

export function getObjKeyVal(fomControl: any, key: string, noValue: any) {

  if (typeof(fomControl) != "undefined"  && typeof(fomControl[key]) != "undefined" && fomControl[key] !== null) {
    return fomControl[key];
  }
  return noValue;
}

export function getDropdownObj(fomControl: any, inKey: string, outkey: string) {

  let res = new Object();
  try {
    let inKeyArr = inKey.split(",");
    let outkeyArr = outkey.split(",");

    for (let index = 0; index < inKeyArr.length; index++) {
      let inElm = inKeyArr[index];
      let outElm = outkeyArr[index];
      res[outElm] = fomControl[inElm];
    }
  } catch (e) {

  }
  return res;

}

export function getDropdownArray(fomControl: any, inKey: string, outkey: string) {

  let res = new Array()
  try {
    let inKeyArr = inKey.split(",");
    let outkeyArr = outkey.split(",");

    fomControl.forEach(element => {
      let obj = new Object();
      for (let index = 0; index < inKeyArr.length; index++) {
        let inElm = inKeyArr[index];
        let outElm = outkeyArr[index];
        obj[outElm] = element[inElm];
      }
      res.push(obj);
    });
  } catch (e) {

  }
  return res;

}

