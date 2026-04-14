import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SettingsService } from '@core/services';
import { StoreSettings } from '@core/models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  private settingsService = inject(SettingsService);
  settings: StoreSettings | null = null;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.settingsService.get().subscribe((data: StoreSettings | null): void => {
      this.settings = data;
    });
  }

  getWhatsAppUrl(): string {
    return `https://wa.me/${this.settings?.whatsAppNumber || ''}`;
  }
}
