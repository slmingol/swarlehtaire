import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Suit, Rank } from '../../model/card';

@Component({
	selector: 'app-card',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss']
})
export class CardComponent {
	@Input() card?: Card;
	@Input() draggable: boolean = false;

	get displayRank(): string {
		if (!this.card) return '';
		switch (this.card.rank) {
			case Rank.ACE: return 'A';
			case Rank.JACK: return 'J';
			case Rank.QUEEN: return 'Q';
			case Rank.KING: return 'K';
			default: return this.card.rank.toString();
		}
	}

	get suitSymbol(): string {
		if (!this.card) return '';
		switch (this.card.suit) {
			case Suit.HEARTS: return '♥';
			case Suit.DIAMONDS: return '♦';
			case Suit.CLUBS: return '♣';
			case Suit.SPADES: return '♠';
			default: return '';
		}
	}

	get isRed(): boolean {
		return this.card?.suit === Suit.HEARTS || this.card?.suit === Suit.DIAMONDS;
	}
}
