import { Injectable } from '@angular/core';
import { MyValidationErrors } from '../models/my-validation-error';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ValidationErrorService {

    allErrors: MyValidationErrors;

    constructor(private notification: NotificationService) {
            this.allErrors = new MyValidationErrors();
    }

    showValidationErrors(errors: any, isDelete?: boolean, genErrorMsg?: boolean, noPopup?: boolean): MyValidationErrors {

        this.allErrors.validationErrors = [];
        this.allErrors.fieldErrors = {};
        if (errors) {
            let count = 0;
            for (let key in errors) {
                if (errors.hasOwnProperty(key)) {
                    count++;
                    let value = errors[key].toString();
                    key = key.toString();
                    if (key === '') {
                        this.allErrors.validationErrors.push(value);
                    } else {
                        // is in the form "object.property"
                        /*if (key.indexOf('.') !== -1) {
                            key = key.substr(key.indexOf('.') + 1);
                        }*/

                        // contans array
                        const leftSqBrIn = key.indexOf('[');
                        const rightSqBrIn = key.indexOf(']');
                        if (leftSqBrIn !== -1 && rightSqBrIn !== -1 && leftSqBrIn < rightSqBrIn) {
                            const innerKey = key.substr(rightSqBrIn + 2);
                            const arrIndex: number = parseInt(key.substr(leftSqBrIn + 1, rightSqBrIn - leftSqBrIn - 1), 10);
                            const newKey = key.substr(0, leftSqBrIn);
                            if (!this.allErrors.fieldErrors.hasOwnProperty(newKey)) {
                            this.allErrors.fieldErrors[newKey] = [];
                            }
                            if (this.allErrors.fieldErrors[newKey][arrIndex] === undefined) {
                            this.allErrors.fieldErrors[newKey][arrIndex] = {};
                            }
                            this.allErrors.fieldErrors[newKey][arrIndex][innerKey] = value;
                        } else if (value.indexOf('.,') === -1) {
                            // check if value is a object of a known format
                            if (errors[key].code) {
                                this.allErrors.fieldErrors[errors[key].code] = errors[key].description;
                            } else if (errors[key][0] && errors[key][0].code) {
                                this.allErrors.fieldErrors[errors[key][0].code] = errors[key][0].description;
                            } else {
                                this.allErrors.fieldErrors[key] = value;
                            }
                        } else {
                            const arr = value.split('.,');
                            value = '';
                            for (const x in arr) {
                                if (arr.hasOwnProperty(x)) {
                                value += arr[x] + '\n';
                                }
                            }
                            this.allErrors.fieldErrors[key] = value;
                        }
                    }
                }
               /*
                else if (key.indexOf(".modelValue") !== -1) {
                    if (holder !== null && holder !== undefined)
                        $scope[holder][key.substr(0, key.indexOf(".modelValue"))] = value;
                    else $scope[capitalize1(key.substr(0, key.indexOf(".modelValue")))] = value;
                }*/
            }
            if (count > 0 && !noPopup && this.allErrors.fieldErrors.canDelete === undefined) {
                // .error(message, title);
                if (isDelete) {
                    this.notification.error('Problem deleting record');
                } else if (genErrorMsg) {
                    this.notification.error('Problem processing request.');
                } else {
                    this.notification.error('Please fill the form correctly');
                }
            }
        } else {
            this.allErrors.validationErrors.push('Problem occurred.');
        }

        return this.allErrors;
    }

}
