import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, RecipientDto, QuoteResponse } from '../../core/services/api.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <h1>Send money to eSewa</h1>
      <p class="subtitle">Fast transfers to Nepal</p>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onAmountSubmit()">
          <div class="form-group">
            <label>Recipient</label>
            <select formControlName="recipientId" (change)="onRecipientChange()">
              <option [ngValue]="null">Select recipient</option>
              @for (r of recipients; track r.id) {
                <option [ngValue]="r.id">{{ r.fullName }} ({{ r.eSewaId }})</option>
              }
            </select>
            <a routerLink="/recipients" class="link">Add recipient</a>
          </div>
          <div class="form-group">
            <label>Amount (USD)</label>
            <input type="number" formControlName="amount" step="0.01" min="1" placeholder="100">
          </div>
          <button type="submit" class="btn btn-secondary" [disabled]="loadingQuote">Get quote</button>
        </form>

        @if (quote) {
          <div class="quote card">
            <h2>Quote</h2>
            <div class="quote-row rate">
              <span>Exchange rate</span>
              <strong>1 USD = {{ quote.exchangeRate | number:'1.2-2' }} NPR</strong>
            </div>
            <div class="quote-row">
              <span>You send</span>
              <strong>\${{ quote.sourceAmount | number:'1.2-2' }}</strong>
            </div>
            <div class="quote-row">
              <span>Fee</span>
              <strong>\${{ quote.fee | number:'1.2-2' }}</strong>
            </div>
            <div class="quote-row">
              <span>They receive</span>
              <strong>रु {{ quote.destinationAmount | number:'1.2-2' }} NPR</strong>
            </div>
            <div class="quote-row total">
              <span>Total</span>
              <strong>\${{ quote.totalAmount | number:'1.2-2' }}</strong>
            </div>
            <button class="btn btn-primary" (click)="startPayment()" [disabled]="paying || !canPay">
              {{ paying ? 'Processing...' : 'Pay with card' }}
            </button>
          </div>
        }
      </div>

      @if (showPaymentForm) {
        <div class="card">
          @if (isMockPayment) {
            <p class="mock-notice">Demo mode: No real payment. Click to simulate transfer.</p>
          } @else {
            <div id="payment-element"></div>
          }
          <button class="btn btn-primary" (click)="confirmPayment()" [disabled]="paying" style="margin-top: 1rem;">
            {{ paying ? 'Processing...' : (isMockPayment ? 'Confirm (Demo)' : 'Confirm and send') }}
          </button>
        </div>
      }
      @if (paymentError) {
        <div class="error-message card">{{ paymentError }}</div>
      }
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    .subtitle { color: var(--text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
    .link { font-size: 0.875rem; color: var(--primary); margin-top: 0.25rem; display: inline-block; }
    .quote { margin-top: 1rem; }
    .quote-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
    .quote-row.total { border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 1rem; }
    #payment-element { margin-top: 1rem; }
    .mock-notice { background: #fef3c7; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; margin: 0 0 1rem; }
  `],
})
export class TransferComponent implements OnInit, OnDestroy {
  form: FormGroup;
  recipients: RecipientDto[] = [];
  quote: QuoteResponse | null = null;
  loadingQuote = false;
  paying = false;
  paymentError = '';
  showPaymentForm = false;
  stripe: any;
  elements: any;
  paymentElement: any;
  clientSecret = '';
  paymentIntentId = '';
  isMockPayment = false;

  get canPay() {
    return this.form.get('recipientId')?.value && this.quote;
  }

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      recipientId: [null as number | null, Validators.required],
      amount: [100, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.api.getRecipients().subscribe({
      next: (list) => (this.recipients = list),
    });
  }

  ngOnDestroy() {
    if (this.elements) {
      this.elements = null;
    }
  }

  onRecipientChange() {
    this.quote = null;
  }

  onAmountSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.form.value.recipientId) return;
    this.loadingQuote = true;
    this.quote = null;
    this.api.getQuote(+this.form.value.amount).subscribe({
      next: (q) => {
        this.quote = q;
        this.loadingQuote = false;
      },
      error: () => (this.loadingQuote = false),
    });
  }

  async startPayment() {
    if (!this.quote || !this.form.value.recipientId) return;
    this.paying = true;
    this.paymentError = '';
    try {
      const res = await this.api.createPaymentIntent(
        this.form.value.recipientId,
        this.form.value.amount,
      ).toPromise();
      if (!res?.clientSecret) throw new Error('No client secret');
      this.clientSecret = res.clientSecret;
      this.paymentIntentId = res.clientSecret.split('_secret_')[0] || '';
      if (this.paymentIntentId.startsWith('pi_mock_')) {
        this.showPaymentForm = true;
        this.isMockPayment = true;
      } else {
        await this.initStripe(res.clientSecret);
        this.showPaymentForm = true;
      }
    } catch (e: any) {
      this.paymentError = e?.error?.error || 'Could not start payment';
    }
    this.paying = false;
  }

  private async initStripe(clientSecret: string) {
    const key = environment.stripePublishableKey;
    if (!key || key.includes('placeholder')) {
      this.paymentError = 'Stripe not configured. Use test mode with pk_test_... in environment.';
      return;
    }
    this.stripe = await loadStripe(key);
    if (!this.stripe) {
      this.paymentError = 'Failed to load Stripe';
      return;
    }
    this.elements = this.stripe.elements({ clientSecret });
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  async confirmPayment() {
    this.paying = true;
    this.paymentError = '';

    if (this.isMockPayment) {
      this.api.confirmTransfer(
        this.paymentIntentId,
        this.form.value.recipientId,
        this.form.value.amount,
      ).subscribe({
        next: (t) => this.router.navigate(['/history', t.id]),
        error: (err) => {
          this.paymentError = err.error?.error || 'Transfer confirmation failed';
          this.paying = false;
        },
        complete: () => (this.paying = false),
      });
      return;
    }

    if (!this.stripe || !this.clientSecret) {
      this.paymentError = 'Stripe not loaded';
      this.paying = false;
      return;
    }
    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/history',
      },
    });
    if (error) {
      this.paymentError = error.message || 'Payment failed';
      this.paying = false;
      return;
    }
    this.api.confirmTransfer(
      this.paymentIntentId,
      this.form.value.recipientId,
      this.form.value.amount,
    ).subscribe({
      next: (t) => this.router.navigate(['/history', t.id]),
      error: (err) => {
        this.paymentError = err.error?.error || 'Transfer confirmation failed';
        this.paying = false;
      },
      complete: () => (this.paying = false),
    });
  }
}
