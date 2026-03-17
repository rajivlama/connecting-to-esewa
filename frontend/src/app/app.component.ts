import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <header>
      <nav>
        <a routerLink="/transfer" routerLinkActive="active">Send</a>
        <a routerLink="/recipients" routerLinkActive="active">Recipients</a>
        <a routerLink="/history" routerLinkActive="active">History</a>
        @if (auth.isLoggedIn()) {
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        } @else {
          <a routerLink="/login">Login</a>
        }
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    header {
      background: white;
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1rem;
    }
    nav {
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    nav a {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
    }
    nav a:hover, nav a.active {
      color: var(--primary);
    }
    main {
      min-height: calc(100vh - 56px);
      padding: 1rem 0;
    }
  `],
})
export class AppComponent {
  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
