import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/api`;

export interface RecipientDto {
  id: number;
  fullName: string;
  eSewaId: string;
  relationship?: string;
}

export interface RecipientRequest {
  fullName: string;
  eSewaId: string;
  relationship?: string;
}

export interface QuoteResponse {
  sourceAmount: number;
  destinationAmount: number;
  fee: number;
  exchangeRate: number;
  totalAmount: number;
  sourceCurrency: string;
  destinationCurrency: string;
}

export interface TransferDto {
  id: number;
  recipient: RecipientDto;
  sourceAmount: number;
  destinationAmount: number;
  fee: number;
  exchangeRate: number;
  totalAmount: number;
  status: string;
  thunesTransactionId?: string;
  createdAt: string;
  completedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getRecipients(): Observable<RecipientDto[]> {
    return this.http.get<RecipientDto[]>(`${BASE}/recipients`);
  }

  getRecipient(id: number): Observable<RecipientDto> {
    return this.http.get<RecipientDto>(`${BASE}/recipients/${id}`);
  }

  createRecipient(body: RecipientRequest): Observable<RecipientDto> {
    return this.http.post<RecipientDto>(`${BASE}/recipients`, body);
  }

  updateRecipient(id: number, body: RecipientRequest): Observable<RecipientDto> {
    return this.http.put<RecipientDto>(`${BASE}/recipients/${id}`, body);
  }

  deleteRecipient(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/recipients/${id}`);
  }

  getQuote(amount: number): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`${BASE}/quote`, { params: { amount } });
  }

  createPaymentIntent(recipientId: number, sourceAmount: number): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(`${BASE}/transfers/payment-intent`, {
      recipientId,
      sourceAmount,
    });
  }

  confirmTransfer(paymentIntentId: string, recipientId: number, sourceAmount: number): Observable<TransferDto> {
    return this.http.post<TransferDto>(`${BASE}/transfers/confirm`, {
      paymentIntentId,
      recipientId,
      sourceAmount,
    });
  }

  getTransfers(): Observable<TransferDto[]> {
    return this.http.get<TransferDto[]>(`${BASE}/transfers`);
  }

  getTransfer(id: number): Observable<TransferDto> {
    return this.http.get<TransferDto>(`${BASE}/transfers/${id}`);
  }
}
