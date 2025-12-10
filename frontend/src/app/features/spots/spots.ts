import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotsService } from './spots.service';

@Component({
  selector: 'app-spots',
  imports: [CommonModule],
  templateUrl: './spots.html'
})
export class SpotsComponent implements OnInit {
  private readonly spotsService = inject(SpotsService);
  message: string | null = null;

  ngOnInit(): void {
    this.spotsService
      .hello()
      .subscribe({
        next: (text) => (this.message = text),
        error: (err) => (this.message = `Error: ${err?.message ?? 'Unknown error'}`),
      });
  }
}
