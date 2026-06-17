import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

// The root component is the app's shell: a header/nav plus a <router-outlet>
// where the router swaps in the active page.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Customer Manager';
}
