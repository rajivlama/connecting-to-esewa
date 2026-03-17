import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, TransferDto } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Transfer history</h1>
      <p class="subtitle">Your recent transfers</p>

      @if (loading) {
        <div class="card">Loading...</div>
      } @else {
        @for (t of transfers; track t.id) {
          <a [routerLink]="['/transfer', t.id]" class="card transfer-card" style="display: block;">
            <div class="transfer-main">
              <strong>To {{ t.recipient.fullName }}</strong>
              <span class="amount">\${{ t.sourceAmount | number:'1.2-2' }} → रु{{ t.destinationAmount | number:'1.2-2' }}</span>
            </div>
            <div class="transfer-meta">
              <span class="status" [class]="t.status.toLowerCase()">{{ t.status }}</span>
              <span class="date">{{ t.createdAt | date:'short' }}</span>
            </div>
          </a>
        }
        @empty {
          <div class="card empty">No transfers yet.</div>
        }
      }
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .subtitle { color: var(--text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
    .transfer-card { display: block; text-decoration: none; color: inherit; }
    .transfer-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    .transfer-main { display: flex; flex-direction: column; gap: 0.25rem; }
    .transfer-main .amount { font-size: 0.9rem; color: var(--text-muted); }
    .transfer-meta { display: flex; justify-content: space-between; margin-top: 0.75rem; font-size: 0.85rem; }
    .status { font-weight: 600; text-transform: capitalize; }
    .status.completed { color: var(--success); }
    .status.failed { color: var(--error); }
    .status.pending, .status.processing { color: var(--accent); }
    .date { color: var(--text-muted); }
    .empty { text-align: center; color: var(--text-muted); }
  `],
})
export class HistoryComponent implements OnInit {
  transfers: TransferDto[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getTransfers().subscribe({
      next: (list) => {
        this.transfers = list;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
