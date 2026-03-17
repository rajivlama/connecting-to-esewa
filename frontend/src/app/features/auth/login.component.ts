import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="card">
        <h1>Log in</h1>
        <p class="subtitle">Send money to eSewa in Nepal</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <div class="error-message">Email is required</div>
            }
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <div class="error-message">Password is required</div>
            }
          </div>
          @if (error) {
            <div class="error-message" style="margin-bottom: 1rem;">{{ error }}</div>
          }
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Log in' }}
          </button>
        </form>
        <p class="foot">Don't have an account? <a routerLink="/register">Sign up</a></p>
      </div>
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .subtitle { color: var(--text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
    .foot { margin-top: 1rem; text-align: center; font-size: 0.9rem; }
    .foot a { color: var(--primary); }
  `],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: () => this.router.navigate(['/transfer']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed';
      },
      complete: () => (this.loading = false),
    });
  }
}
