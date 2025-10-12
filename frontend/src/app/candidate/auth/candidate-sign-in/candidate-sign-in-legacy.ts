import { Component } from '@angular/core';
import { CandidateSignIn } from './candidate-sign-in';

@Component({
  selector: 'app-candidate-sign-in-legacy',
  standalone: true,
  template: `<app-candidate-sign-in></app-candidate-sign-in>`,
  imports: [CandidateSignIn]
})
export class CandidateSignInLegacy {}
