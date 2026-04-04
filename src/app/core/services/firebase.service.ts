import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getRemoteConfig, RemoteConfig, fetchAndActivate, getValue, getString, getBoolean } from 'firebase/remote-config';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FeatureFlags {
  enableTaskPriority: boolean;
  enableTaskDescription: boolean;
  enableDarkMode: boolean;
  enableTaskStats: boolean;
  appBannerMessage: string;
  maxTasksPerCategory: number;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableTaskPriority: true,
  enableTaskDescription: true,
  enableDarkMode: false,
  enableTaskStats: true,
  appBannerMessage: '',
  maxTasksPerCategory: 100,
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private remoteConfig: RemoteConfig | null = null;
  private featureFlagsSubject = new BehaviorSubject<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  private initialized = false;

  readonly featureFlags$: Observable<FeatureFlags> = this.featureFlagsSubject.asObservable();

  constructor() {
    this.initFirebase();
  }

  private async initFirebase(): Promise<void> {
    try {
      // Only initialize Firebase if we have valid credentials (not placeholder values)
      if (environment.firebase && 
          environment.firebase.apiKey && 
          environment.firebase.apiKey !== 'YOUR_API_KEY' &&
          environment.firebase.projectId &&
          environment.firebase.projectId !== 'YOUR_PROJECT_ID') {
        
        this.app = initializeApp(environment.firebase);
        this.remoteConfig = getRemoteConfig(this.app);

        // Set minimum fetch interval (for development use 0, production use 3600)
        this.remoteConfig.settings.minimumFetchIntervalMillis = environment.production ? 3600000 : 60000;

        // Set defaults
        this.remoteConfig.defaultConfig = {
          enableTaskPriority: true,
          enableTaskDescription: true,
          enableDarkMode: false,
          enableTaskStats: true,
          appBannerMessage: '',
          maxTasksPerCategory: 100,
        };

        await this.fetchRemoteConfig();
        this.initialized = true;
        console.log('Firebase initialized successfully');
      } else {
        console.warn('Firebase config not provided or using placeholder values, using default feature flags');
        // Use default flags without Firebase initialization
        this.featureFlagsSubject.next(DEFAULT_FEATURE_FLAGS);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fallback to defaults - app continues working without Firebase
      this.featureFlagsSubject.next(DEFAULT_FEATURE_FLAGS);
    }
  }

  async fetchRemoteConfig(): Promise<void> {
    if (!this.remoteConfig) return;

    try {
      await fetchAndActivate(this.remoteConfig);
      this.updateFeatureFlags();
      console.log('Remote config fetched and activated');
    } catch (error) {
      console.error('Error fetching remote config:', error);
    }
  }

  private updateFeatureFlags(): void {
    if (!this.remoteConfig) return;

    const flags: FeatureFlags = {
      enableTaskPriority: this.getBooleanValue('enableTaskPriority', true),
      enableTaskDescription: this.getBooleanValue('enableTaskDescription', true),
      enableDarkMode: this.getBooleanValue('enableDarkMode', false),
      enableTaskStats: this.getBooleanValue('enableTaskStats', true),
      appBannerMessage: this.getStringValue('appBannerMessage', ''),
      maxTasksPerCategory: this.getNumberValue('maxTasksPerCategory', 100),
    };

    this.featureFlagsSubject.next(flags);
  }

  private getBooleanValue(key: string, defaultValue: boolean): boolean {
    if (!this.remoteConfig) return defaultValue;
    try {
      const value = getValue(this.remoteConfig, key);
      return value.asBoolean();
    } catch {
      return defaultValue;
    }
  }

  private getStringValue(key: string, defaultValue: string): string {
    if (!this.remoteConfig) return defaultValue;
    try {
      const value = getValue(this.remoteConfig, key);
      return value.asString() || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private getNumberValue(key: string, defaultValue: number): number {
    if (!this.remoteConfig) return defaultValue;
    try {
      const value = getValue(this.remoteConfig, key);
      return value.asNumber() || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  getFeatureFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
    return this.featureFlagsSubject.value[key];
  }

  isFeatureEnabled(key: keyof FeatureFlags): boolean {
    const value = this.featureFlagsSubject.value[key];
    return typeof value === 'boolean' ? value : !!value;
  }

  getCurrentFlags(): FeatureFlags {
    return this.featureFlagsSubject.value;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
