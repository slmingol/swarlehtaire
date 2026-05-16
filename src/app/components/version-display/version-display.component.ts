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
      color: rgba(255, 255, 255, 0.7);
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 3px;
      pointer-events: none;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
  `]
})
export class VersionDisplayComponent {
  version = 'v1.0.0';
}
