import { Card, Suit, Rank } from './card';
import { Deck } from './deck';

export class ScorpionGame {
	tableau: Card[][] = [];
	reserve: Card[] = [];
	reserveDealt: boolean = false;

	constructor() {
		this.newGame();
	}

	newGame(): void {
		const deck = new Deck();
		deck.shuffle();
		
		this.tableau = Array.from({ length: 7 }, () => []);
		this.reserve = [];
		this.reserveDealt = false;

		// Deal 49 cards to 7 columns
		let cardIndex = 0;
		for (let col = 0; col < 7; col++) {
			for (let row = 0; row < 7; row++) {
				const card = deck.getCards()[cardIndex++];
				// First 4 columns: first 3 cards face-down
				card.faceUp = col >= 4 || row >= 3;
				this.tableau[col].push(card);
			}
		}

		// 3 reserve cards
		for (let i = 0; i < 3; i++) {
			this.reserve.push(deck.getCards()[cardIndex++]);
		}
	}

	canPlaceOn(card: Card, targetCard: Card): boolean {
		// Build down by suit
		return card.suit === targetCard.suit && card.rank === targetCard.rank - 1;
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
			if (!this.canPlaceOn(movingCards[0], targetCard)) return false;
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

	dealReserve(): boolean {
		if (this.reserveDealt || this.reserve.length === 0) return false;

		// Deal 3 reserve cards to first 3 columns
		for (let i = 0; i < 3 && i < this.reserve.length; i++) {
			this.reserve[i].faceUp = true;
			this.tableau[i].push(this.reserve[i]);
		}

		this.reserveDealt = true;
		return true;
	}

	isWon(): boolean {
		// Check for 4 complete K-A sequences
		let completedSuits = 0;

		for (const pile of this.tableau) {
			if (pile.length !== 13) continue;
			
			// Check if it's K-A sequence of same suit
			let isComplete = true;
			const suit = pile[0].suit;
			
			for (let i = 0; i < 13; i++) {
				if (pile[i].suit !== suit || pile[i].rank !== Rank.KING - i) {
					isComplete = false;
					break;
				}
			}

			if (isComplete) completedSuits++;
		}

		return completedSuits >= 4;
	}
}
