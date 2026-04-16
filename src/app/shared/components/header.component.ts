import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  private router = inject(Router);
  settings: StoreSettings | null = null;
  mobileMenuOpen = false;

  ngOnInit(): void {
    this.settingsService.get().subscribe((data: StoreSettings | null): void => {
      this.settings = data;
    });
  }

  get isHomePage(): boolean {
    return this.router.url === '/' || this.router.url.startsWith('/#');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateHome(): void {
    this.mobileMenuOpen = false;
    if (this.router.url === '/' || this.router.url.startsWith('/#')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  scrollToSection(sectionId: string): void {
    this.mobileMenuOpen = false;
    if (this.router.url === '/' || this.router.url.startsWith('/#')) {
      this.smoothScrollTo(sectionId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.smoothScrollTo(sectionId), 300);
      });
    }
  }

  private smoothScrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
