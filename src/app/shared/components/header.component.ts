import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SettingsService } from '@core/services';
import { StoreSettings } from '@core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  private settingsService = inject(SettingsService);
  settings: StoreSettings | null = null;
  mobileMenuOpen = false;

  ngOnInit(): void {
    this.settingsService.get().subscribe((data: StoreSettings | null): void => {
      this.settings = data;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
