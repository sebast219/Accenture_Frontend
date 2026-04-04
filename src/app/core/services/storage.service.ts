import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _initialized = new BehaviorSubject<boolean>(false);

  constructor(private storage: Storage) {
    this.init();
  }

  async init(): Promise<void> {
    if (this._storage) return;
    const storage = await this.storage.create();
    this._storage = storage;
    this._initialized.next(true);
  }

  get initialized$(): Observable<boolean> {
    return this._initialized.asObservable();
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    return this._storage?.get(key) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureInitialized();
    await this._storage?.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.ensureInitialized();
    await this._storage?.remove(key);
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    await this._storage?.clear();
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized();
    return this._storage?.keys() ?? [];
  }

  private async ensureInitialized(): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
  }
}
