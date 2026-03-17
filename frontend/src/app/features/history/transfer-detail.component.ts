import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, TransferDto } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading) {
        <div class="card">Loading...</div>
      } @else if (transfer) {
        <a routerLink="/history" class="back">← Back to history</a>
        @if (transfer.status === 'COMPLETED') {
          <div class="card success-banner">Transfer completed. Funds have been sent to eSewa.</div>
        }
        @if (transfer.status === 'FAILED') {
          <div class="card error-banner">Transfer failed. Please contact support if you were charged.</div>
        }
        <div class="card">
          <h1>Transfer details</h1>
          <div class="detail-row">
            <span>Status</span>
            <strong class="status" [class]="transfer.status.toLowerCase()">{{ transfer.status }}</strong>
          </div>
          <div class="detail-row">
            <span>Recipient</span>
            <strong>{{ transfer.recipient.fullName }}</strong>
          </div>
          <div class="detail-row">
            <span>eSewa ID</span>
            <strong>{{ transfer.recipient.eSewaId }}</strong>
          </div>
          <div class="detail-row">
            <span>You sent</span>
            <strong>\${{ transfer.sourceAmount | number:'1.2-2' }} USD</strong>
          </div>
          <div class="detail-row">
            <span>They received</span>
            <strong>रु {{ transfer.destinationAmount | number:'1.2-2' }} NPR</strong>
          </div>
          <div class="detail-row">
            <span>Fee</span>
            <strong>\${{ transfer.fee | number:'1.2-2' }}</strong>
          </div>
          @if (transfer.thunesTransactionId) {
            <div class="detail-row">
              <span>Transaction ID</span>
              <strong>{{ transfer.thunesTransactionId }}</strong>
            </div>
          }
          <div class="detail-row">
            <span>Date</span>
            <strong>{{ transfer.createdAt | date:'medium' }}</strong>
          </div>
        </div>
      } @else {
        <div class="card">Transfer not found.</div>
      }
    </div>
  `,
  styles: [`
    .back { display: inline-block; margin-bottom: 1rem; color: var(--primary); text-decoration: none; }
    h1 { margin: 0 0 1rem; font-size: 1.25rem; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .detail-row:last-child { border-bottom: none; }
    .status.completed { color: var(--success); }
    .status.failed { color: var(--error); }
    .status.pending, .status.processing { color: var(--accent); }
    .success-banner { background: #dcfce7; color: #166534; }
    .error-banner { background: #fee2e2; color: #991b1b; }
  `],
})
export class TransferDetailComponent implements OnInit {
  id = input.required<string>();
  transfer: TransferDto | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    const idStr = this.id();
    const id = idStr ? parseInt(idStr, 10) : 0;
    if (id) {
      this.api.getTransfer(id).subscribe({
        next: (t) => {
          this.transfer = t;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
    } else {
      this.loading = false;
    }
  }
}
