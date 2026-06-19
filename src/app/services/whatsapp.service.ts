import { inject, signal, computed, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SendResult } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private http = inject(HttpClient);

 
  // ── Meta config ───────────────────────────────────────
  metaPhoneNumberId = '1034778359727363';
  metaAccessToken = 'EAANo5vnWtUABRvhHIZBKuOHV52rKJEWu9ECr0oVGL5HwiwQzi4bRW20kD5HgINpZCWYCBdnsEnsm8gzYNdeT2uzxpHigCIsBENqRHE8dkK52j7YH5cnZBvkWed7zTy8DQMJzlhY0ee2ojIfMlR9G3fUYKi0bM1SYavZCwNqjS12wGm9rfTa2VBjov3uSsYg2mxxFdrWp2UC8mU0cUvELUXuBr6UOnTtzPCjBiIAY8oOkUa0aaNPkZCdObgNMyAstCGtfhApE3Um9GXUtkAWpvIORS94M8jhZAmXmAZD';
  metaGroups: { name: string; id: string }[] = [];
  selectedGroupId = '';
  customGroupId = '';

  // ── JSON ─────────────────────────────────────────────
  jsonInput = JSON.stringify({ orderId: 'ORD-001', status: 'shipped', eta: '2026-06-16' }, null, 2);

  // ── State ─────────────────────────────────────────────
  sending = signal(false);
  result = signal<SendResult | null>(null);
  //results = signal<Array<{ to: string; success: boolean; messageId?: string; error?: string }>>([]);

  // ── Derived ───────────────────────────────────────────
  jsonError = computed(() => {
    if (!this.jsonInput.trim()) return '';
    try {
      JSON.parse(this.jsonInput);
      return '';
    } catch (e: any) {
      return e.message;
    }
  });

  preview = computed(() => {
    if (!this.jsonInput.trim() || this.jsonError()) return '';
    try {
      const parsed = JSON.parse(this.jsonInput);
      return this.buildMessageText(parsed);
    } catch {
      return '';
    }
  });

  canSend = computed(
    () =>
      !!this.metaPhoneNumberId.trim() &&
      !!this.metaAccessToken.trim() &&
      //!!this.recipientPhone() &&
      !this.jsonError() &&
      !!this.jsonInput.trim(),
  );

  /** Converts a parsed JSON object into a readable WhatsApp message */
  private buildMessageText(data: unknown, indent = 0): string {
    if (typeof data !== 'object' || data === null) return String(data);
    if (Array.isArray(data)) {
      return data.map((v, i) => `  ${i + 1}. ${this.buildMessageText(v, indent + 1)}`).join('\n');
    }
    const lines = Object.entries(data as Record<string, unknown>).map(([k, v]) => {
      const key = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      const val =
        typeof v === 'object' && v !== null ? '\n' + this.buildMessageText(v, indent + 1) : ` ${v}`;
      return `${'  '.repeat(indent)}*${key}:*${val}`;
    });
    return lines.join('\n');
  }
  async send(Order: any) {
    this.result.set(null);
    this.sending.set(true);
    try {
      const parsed = JSON.parse(this.jsonInput);

      console.log('sending message ', parsed);
      const messageText = this.buildMessageText(parsed);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.metaAccessToken}`,
      });

      const body = {
        messaging_product: 'whatsapp',
        //to: +919487650026, //this.recipientPhone(),
        to: +918861394321,
        type: 'template',
        //text: { body: messageText },
        template: {
          name: 'jaspers_market_order_confirmation_v1',
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'John Doe' },
                { type: 'text', text: JSON.stringify(Order.items) },
                { type: 'text', text: 'Jun 15, 2026' },
              ],
            },
          ],
        },
      };

      const response: any = await firstValueFrom(
        this.http.post(`https://graph.facebook.com/v25.0/${this.metaPhoneNumberId}/messages`, body, {
          headers,
        }),
      );

      this.result.set({
        to:'',
        success: true,
        messageId: response?.messages?.[0]?.id ?? 'N/A',
      });
    } catch (err: any) {
      const errMsg = err?.error?.error?.message ?? err?.message ?? 'Unknown error occurred';
      this.result.set({ to:'', success: false, error: errMsg });
    } finally {
      this.sending.set(false);
    }
  }

   /** Load groups using Meta Groups API */
  async loadMetaGroups() {
    if (!this.metaPhoneNumberId || !this.metaAccessToken) {
      alert('Enter Phone Number ID and Access Token first.');
      return;
    }
    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.metaAccessToken}` });
      const res: any = await firstValueFrom(
        this.http.get(
          `https://graph.facebook.com/v20.0/${this.metaPhoneNumberId}/groups`,
          { headers }
        )
      );
      this.metaGroups = (res?.data ?? []).map((g: any) => ({ name: g.name ?? g.id, id: g.id }));
      if (!this.metaGroups.length) alert('No groups found for this number.');
    } catch (e: any) {
      alert('Failed to load groups: ' + (e?.error?.error?.message ?? e.message));
    }
  }

   private async sendMetaGroup() {
    const groupId = this.customGroupId.trim() || this.selectedGroupId;
    const messageText = this.buildMessageText(JSON.parse(this.jsonInput));
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.metaAccessToken}`,
    });
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'group',     // <-- Groups API extension
      to: groupId,
      type: 'text',
      text: { body: messageText },
    };
    try {
      const res: any = await firstValueFrom(
        this.http.post(`https://graph.facebook.com/v20.0/${this.metaPhoneNumberId}/messages`, body, { headers })
      );
      this.result.set({ to: groupId, success: true, messageId: res?.messages?.[0]?.id ?? 'N/A' });
    } catch (e: any) {
      this.result.set({ to: groupId, success: false, error: e?.error?.error?.message ?? e.message });
    }
  }
}
