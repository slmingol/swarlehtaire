import { Injectable, OnDestroy } from '@angular/core';

const DESKTOP_CARD_W = 116;
const DESKTOP_CARD_H = 163;

@Injectable({ providedIn: 'root' })
export class CardSizeService implements OnDestroy {
    private columns = 7;
    private readonly resizeHandler = () => this.apply();

    constructor() {
        window.addEventListener('resize', this.resizeHandler, { passive: true });
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.resizeHandler);
    }

    /** Call from each board's ngOnInit with the number of columns that layout requires. */
    setColumns(cols: number): void {
        this.columns = cols;
        this.apply();
    }

    private apply(): void {
        const vw = window.innerWidth;
        // Only override for mobile/tablet — desktop uses SCSS :root defaults
        if (vw > 699) {
            this.clearOverrides();
            return;
        }

        const boardPad = vw <= 499 ? 4 : 14;
        const gap = vw <= 499 ? 2 : 8;
        const cardW = Math.floor((vw - 2 * boardPad - (this.columns - 1) * gap) / this.columns);
        const cardH = Math.round(cardW * DESKTOP_CARD_H / DESKTOP_CARD_W);
        const scale = cardW / DESKTOP_CARD_W;

        const r = document.documentElement.style;
        r.setProperty('--card-w', `${cardW}px`);
        r.setProperty('--card-h', `${cardH}px`);
        r.setProperty('--card-gap', `${gap}px`);
        r.setProperty('--card-pad', `${Math.max(3, Math.round(9 * scale))}px`);
        r.setProperty('--card-rank-size', `${Math.max(15, Math.round(26 * scale))}px`);
        r.setProperty('--card-suit-size', `${Math.max(13, Math.round(23 * scale))}px`);
        r.setProperty('--card-suit-large', `${Math.max(34, Math.round(70 * scale))}px`);
        r.setProperty('--card-col-offset', `-${Math.round(90 * scale)}px`);
        r.setProperty('--card-spread-v', `${Math.round(cardH * 3.56)}px`);
        r.setProperty('--card-spread-h', `${Math.round(cardW * 0.4)}px`);
        r.setProperty('--board-pad', `${boardPad}px`);
    }

    private clearOverrides(): void {
        const props = [
            '--card-w', '--card-h', '--card-gap', '--card-pad',
            '--card-rank-size', '--card-suit-size', '--card-suit-large',
            '--card-col-offset', '--card-spread-v', '--card-spread-h', '--board-pad'
        ];
        const r = document.documentElement.style;
        props.forEach(p => r.removeProperty(p));
    }
}
