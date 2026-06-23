import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Suit, CardUtils } from '../../model/card';
import { CardComponent } from '../card/card.component';

@Component({
	selector: 'app-stack',
	standalone: true,
	imports: [CommonModule, CardComponent],
	templateUrl: './stack.component.html',
	styleUrls: ['./stack.component.scss']
})
export class StackComponent {
	@Input() cards: Card[] = [];
	@Input() stackType: 'stock' | 'waste' | 'foundation' | 'tableau' = 'tableau';
	@Input() spread: 'none' | 'down' | 'right' = 'down';
	@Input() passClickThrough = false;
	@Output() cardClick = new EventEmitter<{ card: Card; index: number }>();
	@Output() stackClick = new EventEmitter<void>();
	@Output() cardDragStart = new EventEmitter<number>();
	@Output() cardDragEnd = new EventEmitter<void>();
	@Output() stackDrop = new EventEmitter<void>();

	isDragOver = false;

	// Pointer drag state
	private touchStartX = 0;
	private touchStartY = 0;
	private isDragging = false;
	private dragCardIndex = -1;
	private ghost: HTMLElement | null = null;
	private wasDragging = false;
	private readonly DRAG_THRESHOLD = 10;

	onCardClick(card: Card, index: number): void {
		if (this.wasDragging) { this.wasDragging = false; return; }
		if (card.faceUp) {
			this.cardClick.emit({ card, index });
		} else if (this.stackType === 'stock') {
			this.stackClick.emit();
		}
	}

	onPointerDown(event: PointerEvent, index: number): void {
		if (!this.cards[index]?.faceUp) return;
		this.touchStartX = event.clientX;
		this.touchStartY = event.clientY;
		this.dragCardIndex = index;
		this.isDragging = false;
		this.wasDragging = false;
	}

	onPointerMove(event: PointerEvent): void {
		if (this.dragCardIndex < 0) return;
		const dx = event.clientX - this.touchStartX;
		const dy = event.clientY - this.touchStartY;
		if (!this.isDragging && Math.sqrt(dx * dx + dy * dy) > this.DRAG_THRESHOLD) {
			this.isDragging = true;
			(event.currentTarget as Element).setPointerCapture(event.pointerId);
			this.onCardDragStart(this.dragCardIndex);
			this.createGhost(event, this.dragCardIndex);
		}
		if (this.isDragging) {
			event.preventDefault();
			this.moveGhost(event);
		}
	}

	onPointerUp(event: PointerEvent): void {
		if (this.isDragging) {
			this.wasDragging = true;
			this.removeGhost();
			const el = document.elementFromPoint(event.clientX, event.clientY);
			const stackEl = el?.closest('.stack');
			if (stackEl) {
				stackEl.dispatchEvent(new DragEvent('dragover', { bubbles: false, cancelable: true }));
				stackEl.dispatchEvent(new DragEvent('drop', { bubbles: false, cancelable: true }));
			}
			this.onCardDragEnd();
		}
		this.isDragging = false;
		this.dragCardIndex = -1;
	}

	onPointerCancel(): void {
		this.removeGhost();
		if (this.isDragging) this.onCardDragEnd();
		this.isDragging = false;
		this.dragCardIndex = -1;
	}

	private createGhost(event: PointerEvent, index: number): void {
		const card = this.cards[index];
		if (!card) return;
		const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
		const rank = CardUtils.getRankName(card.rank);
		const suit = CardUtils.getSuitSymbol(card.suit);
		const cardW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w').trim()) || 116;
		const cardH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-h').trim()) || 163;
		const dragCount = this.cards.length - index;
		const ghost = document.createElement('div');
		ghost.style.cssText = [
			'position:fixed',
			`width:${cardW}px`,
			`height:${Math.min(cardH + (dragCount - 1) * 20, cardH * 2)}px`,
			'background:white',
			'border:2px solid #aaa',
			'border-radius:8px',
			'box-shadow:0 8px 24px rgba(0,0,0,0.5)',
			'pointer-events:none',
			'z-index:9999',
			'opacity:0.9',
			'display:flex',
			'align-items:flex-start',
			'padding:4px 6px',
			`color:${isRed ? '#d32f2f' : '#212121'}`,
			'font-size:16px',
			'font-weight:bold',
			'font-family:sans-serif',
			`left:${event.clientX - cardW / 2}px`,
			`top:${event.clientY - 20}px`,
		].join(';');
		ghost.textContent = `${rank}${suit}`;
		document.body.appendChild(ghost);
		this.ghost = ghost;
	}

	private moveGhost(event: PointerEvent): void {
		if (!this.ghost) return;
		const cardW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w').trim()) || 116;
		this.ghost.style.left = `${event.clientX - cardW / 2}px`;
		this.ghost.style.top = `${event.clientY - 20}px`;
	}

	private removeGhost(): void {
		if (this.ghost) {
			this.ghost.remove();
			this.ghost = null;
		}
	}

	onStackClick(): void {
		// Stock pile should always be clickable to draw cards
		if (this.stackType === 'stock') {
			this.stackClick.emit();
		} else if (this.cards.length === 0) {
			// Other piles only emit when empty
			this.stackClick.emit();
		}
	}

	onCardDragStart(index: number): void {
		this.cardDragStart.emit(index);
	}

	onCardDragEnd(): void {
		this.cardDragEnd.emit();
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = true;
	}

	onDragLeave(): void {
		this.isDragOver = false;
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = false;
		this.stackDrop.emit();
	}

	private get cardScale(): number {
		const cardW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-w').trim()) || 116;
		return cardW / 116;
	}

	getCardStyle(index: number): { [key: string]: string } {
		if (this.spread === 'none') {
			return {};
		}

		const scale = this.cardScale;
		const offset = this.spread === 'down' ? Math.round(35 * scale) : Math.round(18 * scale);
		const faceDownSpacing = Math.max(3, Math.round(6 * scale));
		const visibleCards = this.cards.filter(c => c.faceUp).length;
		const faceDownCards = this.cards.length - visibleCards;

		let position: number;
		if (index < faceDownCards) {
			position = index * faceDownSpacing;
		} else {
			position = (faceDownCards * faceDownSpacing) + ((index - faceDownCards) * offset);
		}

		return {
			[this.spread === 'down' ? 'top' : 'left']: `${position}px`,
			'z-index': `${index}`
		};
	}

	// Check if we can drag from this card index in tableau
	// (all cards from this index onward must be face-up)
	canDragFrom(index: number): boolean {
		// Must be face-up
		if (!this.cards[index]?.faceUp) return false;
		
		// All cards from this index to the end must be face-up
		for (let i = index; i < this.cards.length; i++) {
			if (!this.cards[i].faceUp) return false;
		}
		
		return true;
	}
}
