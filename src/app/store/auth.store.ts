import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  avatarInitials: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  // ── State ──
  private readonly _currentUser = signal<AuthUser | null>({
    id: 'u-001',
    fullName: 'Arjun Mehta',
    email: 'arjun.mehta@company.com',
    avatarInitials: 'AM',
    role: 'Inventory Manager',
  });

  private readonly _isAuthenticated = signal(true);

  // ── Selectors ──
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  readonly displayName = computed(() => this._currentUser()?.fullName ?? 'Guest');
  readonly initials = computed(() => this._currentUser()?.avatarInitials ?? '?');
  readonly userRole = computed(() => this._currentUser()?.role ?? '');
  readonly userEmail = computed(() => this._currentUser()?.email ?? '');

  // ── Actions ──
  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    // In a real app: clear tokens, call API, redirect to login
    console.log('User logged out');
  }

  /** Simulate login — replace with real auth flow */
  login(user: AuthUser): void {
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
  }
}
