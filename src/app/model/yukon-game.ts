import { Card, Suit, Rank } from './card';
import { Deck } from './deck';

export class YukonGame {
	tableau: Card[][] = [];
	foundations: Card[][] = [];

	constructor() {
		this.newGame();
	}

	newGame(): void {
		const deck = new Deck();
		deck.shuffle();
		
		this.tableau = Array.from({ length: 7 }, () => []);
		this.foundations = Array.from({ length: 4 }, () => []);

		const cards = deck.getCards();
		const columnLengths = [1, 6, 7, 8, 9, 10, 11];
		
		let cardIndex = 0;
		for (let col = 0; col < 7; col++) {
			const columnLength = columnLengths[col];
			for (let row = 0; row < columnLength; row++) {
				const card = cards[cardIndex++];
				// Top 5 cards face-up, rest face-down
				card.faceUp = row >= columnLength - 5;
				this.tableau[col].push(card);
			}
		}
	}

	canPlaceOnTableau(card: Card, targetCard: Card): boolean {
		// Build down by alternating colors
		const differentColor = (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) !==
							   (targetCard.suit === Suit.HEARTS || targetCard.suit === Suit.DIAMONDS);
		return differentColor && card.rank === targetCard.rank - 1;
	}

	canPlaceOnFoundation(card: Card): boolean {
		const foundationIndex = card.suit;
		const foundation = this.foundations[foundationIndex];
		
		if (foundation.length === 0) {
			return card.rank === Rank.ACE;
		}
		
		const topCard = foundation[foundation.length - 1];
		return card.suit === topCard.suit && card.rank === topCard.rank + 1;
	}

	moveToFoundation(fromCol: number): boolean {
		const pile = this.tableau[fromCol];
		if (pile.length === 0) return false;
		
		const card = pile[pile.length - 1];
		if (!card.faceUp || !this.canPlaceOnFoundation(card)) return false;
		
		this.foundations[card.suit].push(pile.pop()!);
		
		// Turn over face-down card if exposed
		if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
			pile[pile.length - 1].faceUp = true;
		}
		
		return true;
	}

	moveCards(fromCol: number, cardIndex: number, toCol: number): boolean {
		if (fromCol === toCol) return false;
		
		const fromPile = this.tableau[fromCol];
		if (cardIndex >= fromPile.length) return false;
		if (!fromPile[cardIndex].faceUp) return false;

		const movingCards = fromPile.slice(cardIndex);
		const toPile = this.tableau[toCol];

		if (toPile.length === 0) {
			// Only King can go to empty space
			if (movingCards[0].rank !== Rank.KING) return false;
		} else {
			const targetCard = toPile[toPile.length - 1];
			if (!this.canPlaceOnTableau(movingCards[0], targetCard)) return false;
		}

		// Move cards
		this.tableau[fromCol] = fromPile.slice(0, cardIndex);
		this.tableau[toCol].push(...movingCards);

		// Turn over face-down card if exposed
		if (this.tableau[fromCol].length > 0) {
			const topCard = this.tableau[fromCol][this.tableau[fromCol].length - 1];
			if (!topCard.faceUp) {
				topCard.faceUp = true;
			}
		}

		return true;
	}

	isWon(): boolean {
		return this.foundations.every(f => f.length === 13);
	}
}
