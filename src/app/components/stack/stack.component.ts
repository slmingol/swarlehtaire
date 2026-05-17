import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../model/card';
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
	@Output() cardClick = new EventEmitter<{ card: Card; index: number }>();
	@Output() stackClick = new EventEmitter<void>();
	@Output() cardDragStart = new EventEmitter<number>();
	@Output() cardDragEnd = new EventEmitter<void>();
	@Output() stackDrop = new EventEmitter<void>();

	isDragOver = false;

	onCardClick(card: Card, index: number): void {
		if (card.faceUp) {
			this.cardClick.emit({ card, index });
		} else if (this.stackType === 'stock') {
			// Face-down stock cards should trigger stack click (draw cards)
			this.stackClick.emit();
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
		const offset = this.spread === 'down' ? Math.round(35 * scale) : Math.round(44 * scale);
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
