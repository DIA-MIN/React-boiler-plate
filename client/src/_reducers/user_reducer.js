import {LOGIN_USER} from './../_actions/types';

export default function (state = {}, action) {
  switch (action.type) {
    case LOGIN_USER: // 'login_user'
      return {...state, loginSuccess: action.payload};
      break;

    default:
      return state;
  }
}
