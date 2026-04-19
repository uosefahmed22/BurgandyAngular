import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '@core/services';

@Component({
  selector: 'app-whatsapp-fab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-fab.component.html',

})
export class WhatsappFabComponent implements OnInit {
  private settingsService = inject(SettingsService);
  whatsAppNumber: string | null = '2001141841861';

  ngOnInit() {
    this.settingsService.get().subscribe((data: any) => {
      this.whatsAppNumber = data?.whatsAppNumber || '2001141841861';
    });
  }
}
