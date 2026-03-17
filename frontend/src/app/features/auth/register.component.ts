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
        <h1>Create account</h1>
        <p class="subtitle">Start sending money to Nepal</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Full name</label>
            <input type="text" formControlName="fullName" placeholder="John Doe">
            @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
              <div class="error-message">Name is required</div>
            }
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <div class="error-message">Valid email is required</div>
            }
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="Min 6 characters">
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <div class="error-message">Password must be at least 6 characters</div>
            }
          </div>
          <div class="form-group">
            <label>Phone (optional)</label>
            <input type="tel" formControlName="phone" placeholder="+1 234 567 8900">
          </div>
          <div class="form-group">
            <label>Country</label>
            <select formControlName="country">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          @if (error) {
            <div class="error-message" style="margin-bottom: 1rem;">{{ error }}</div>
          }
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Sign up' }}
          </button>
        </form>
        <p class="foot">Already have an account? <a routerLink="/login">Log in</a></p>
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
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      country: ['US'],
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/transfer']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed';
      },
      complete: () => (this.loading = false),
    });
  }
}
