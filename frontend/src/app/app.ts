import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Sidebar } from './candidate/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'optern-student';
}
