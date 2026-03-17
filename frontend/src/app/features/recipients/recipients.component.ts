import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, RecipientDto, RecipientRequest } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>Recipients</h1>
      <p class="subtitle">Add people who will receive money in their eSewa wallet</p>

      <div class="card">
        <h2>{{ editingId ? 'Edit recipient' : 'Add recipient' }}</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Full name</label>
            <input type="text" formControlName="fullName" placeholder="Ram Sharma">
          </div>
          <div class="form-group">
            <label>eSewa ID (mobile or email)</label>
            <input type="text" formControlName="eSewaId" placeholder="9806800001">
            <small class="hint">10-digit Nepal mobile (98/97) or eSewa email</small>
          </div>
          <div class="form-group">
            <label>Relationship (optional)</label>
            <input type="text" formControlName="relationship" placeholder="Family, Friend...">
          </div>
          @if (formError) {
            <div class="error-message" style="margin-bottom: 1rem;">{{ formError }}</div>
          }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : (editingId ? 'Update' : 'Add') }}
            </button>
            @if (editingId) {
              <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
            }
          </div>
        </form>
      </div>

      <div class="list">
        @for (r of recipients; track r.id) {
          <div class="card recipient-card">
            <div class="recipient-info">
              <strong>{{ r.fullName }}</strong>
              <span class="esewa">{{ r.eSewaId }}</span>
              @if (r.relationship) {
                <span class="relationship">{{ r.relationship }}</span>
              }
            </div>
            <div class="recipient-actions">
              <button class="btn btn-secondary" (click)="edit(r)">Edit</button>
              <button class="btn btn-secondary" (click)="delete(r.id)">Delete</button>
            </div>
          </div>
        }
        @empty {
          <div class="card empty">No recipients yet. Add one above.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    .subtitle { color: var(--text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
    .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; display: block; }
    .form-actions { display: flex; gap: 0.5rem; }
    .form-actions .btn-primary { flex: 1; }
    .recipient-card { display: flex; justify-content: space-between; align-items: center; }
    .recipient-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .recipient-info .esewa { font-size: 0.9rem; color: var(--text-muted); }
    .recipient-info .relationship { font-size: 0.8rem; color: var(--primary); }
    .recipient-actions { display: flex; gap: 0.5rem; }
    .empty { text-align: center; color: var(--text-muted); }
  `],
})
export class RecipientsComponent implements OnInit {
  form: FormGroup;
  recipients: RecipientDto[] = [];
  editingId: number | null = null;
  saving = false;
  formError = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      eSewaId: ['', [Validators.required, Validators.pattern(/^(98|97)\d{8}$|^[\w.-]+@[\w.-]+\.\w+$/)]],
      relationship: [''],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getRecipients().subscribe({
      next: (list) => (this.recipients = list),
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving = true;
    this.formError = '';
    const body: RecipientRequest = this.form.value;
    const req = this.editingId
      ? this.api.updateRecipient(this.editingId, body)
      : this.api.createRecipient(body);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.form.reset();
        this.editingId = null;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.error || 'Failed';
      },
    });
  }

  edit(r: RecipientDto) {
    this.editingId = r.id;
    this.form.patchValue({
      fullName: r.fullName,
      eSewaId: r.eSewaId,
      relationship: r.relationship || '',
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset();
    this.formError = '';
  }

  delete(id: number) {
    if (!confirm('Delete this recipient?')) return;
    this.api.deleteRecipient(id).subscribe({
      next: () => this.load(),
    });
  }
}
