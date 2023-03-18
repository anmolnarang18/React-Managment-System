import {EMAIL_VALIDATION} from '../shared/Constants';

export const handleValidation = (val, type, name = 'name') => {
  switch (type) {
    case 'EMAIL':
      if (!val || !EMAIL_VALIDATION.test(val)) {
        return {
          val: val,
          isValid: false,
          errMsg: 'Email is invalid',
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }
    case 'PASSWORD':
      if (!val) {
        return {
          val: val,
          isValid: false,
          errMsg: 'Please Enter Password.',
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }

    case 'STRING':
      if (!val || val.length < 3) {
        return {
          val: val,
          isValid: false,
          errMsg: `Please enter valid ${name}`,
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }

    case 'NUMBER':
      if (!val || val == 0) {
        return {
          val: val,
          isValid: false,
          errMsg: `Please enter ${name}`,
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }

    default:
      break;
  }
};
