import { Component } from '@angular/core';

@Component({
  selector: 'app-version-display',
  standalone: true,
  imports: [],
  template: `
    <div class="version-display">
      <span class="game-name">Swarlehtaire</span>
      <span class="version">{{ version }}</span>
    </div>
  `,
  styles: [`
    .version-display {
      position: fixed;
      bottom: 12px;
      right: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, rgba(20, 20, 40, 0.85), rgba(40, 20, 60, 0.85));
      padding: 8px 16px;
      border-radius: 8px;
      pointer-events: none;
      user-select: none;
      z-index: 9999;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .game-name {
      font-size: 18px;
      font-weight: 600;
      background: linear-gradient(135deg, #4ade80, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.5px;
    }

    .version {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
      letter-spacing: 0.5px;
    }
  `]
})
export class VersionDisplayComponent {
  version = 'v1.0.0';
}
