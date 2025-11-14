import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotsService } from './spots.service';

@Component({
  selector: 'app-spots',
  imports: [CommonModule],
  template: `
    <section style="padding: 1rem">
      <h2>Spots</h2>
      <p>Backend says:</p>
      <pre style="background:#f5f5f5;padding:.5rem;border-radius:4px">{{ message || 'Loading...' }}</pre>
    </section>
  `
})
export class SpotsComponent implements OnInit {
  private readonly spotsService = inject(SpotsService);
  message: string | null = null;

  ngOnInit(): void {
    // Delegate data access to the service (best practice)
    this.spotsService
      .hello()
      .subscribe({
        next: (text) => (this.message = text),
        error: (err) => (this.message = `Error: ${err?.message ?? 'Unknown error'}`),
      });
  }
}
