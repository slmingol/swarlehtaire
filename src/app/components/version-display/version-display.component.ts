import { Component } from '@angular/core';

@Component({
  selector: 'app-version-display',
  standalone: true,
  imports: [],
  template: `
    <div class="version-display">
      <span>{{ version }}</span>
    </div>
  `,
  styles: [`
    .version-display {
      position: fixed;
      bottom: 8px;
      right: 12px;
      font-size: 11px;
      color: rgba(128, 128, 128, 0.5);
      pointer-events: none;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      z-index: 9999;
    }

    .version-display span {
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }

    .version-display:hover span {
      opacity: 0.8;
    }
  `]
})
export class VersionDisplayComponent {
  version = 'v1.0.0';
}
