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
		}
	}

	onStackClick(): void {
		if (this.cards.length === 0) {
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

	getCardStyle(index: number): { [key: string]: string } {
		if (this.spread === 'none') {
			return {};
		}

		const offset = this.spread === 'down' ? 24 : 30;
		const visibleCards = this.cards.filter(c => c.faceUp).length;
		const faceDownCards = this.cards.length - visibleCards;
		
		// Tighter spacing for face-down cards
		let position: number;
		if (index < faceDownCards) {
			position = index * 4; // 4px spacing for face-down
		} else {
			position = (faceDownCards * 4) + ((index - faceDownCards) * offset);
		}

		return {
			[this.spread === 'down' ? 'top' : 'left']: `${position}px`
		};
	}
}
