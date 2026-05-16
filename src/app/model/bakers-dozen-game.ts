import { Card, Suit, Rank } from './card';
import { Deck } from './deck';

export interface BakersDozenMove {
	type: 'move' | 'toFoundation';
	fromCol: number;
	toCol?: number;
	card: Card;
	foundationIndex?: number;
}

export class BakersDDozenGame {
	tableau: Card[][] = [];
	foundations: Card[][] = [];
	moveHistory: BakersDozenMove[] = [];

	get canUndo(): boolean {
		return this.moveHistory.length > 0;
	}

	get moveCount(): number {
		return this.moveHistory.length;
	}

	constructor() {
		this.newGame();
	}
	private suitToIndex(suit: Suit): number {
		return [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES].indexOf(suit);
	}
	newGame(): void {
		const deck = new Deck();
		deck.shuffle();
		
		this.tableau = Array.from({ length: 13 }, () => []);
		this.foundations = Array.from({ length: 4 }, () => []);
		this.moveHistory = [];

		const cards = deck.getCards();
		
		// Deal 4 cards to each of 13 columns (all face-up)
		let cardIndex = 0;
		for (let col = 0; col < 13; col++) {
			for (let row = 0; row < 4; row++) {
				const card = cards[cardIndex++];
				card.faceUp = true;
				this.tableau[col].push(card);
			}
		}

		// Move all Kings to bottom of their columns
		for (const pile of this.tableau) {
			const kings: Card[] = [];
			const nonKings: Card[] = [];
			
			for (const card of pile) {
				if (card.rank === Rank.KING) {
					kings.push(card);
				} else {
					nonKings.push(card);
				}
			}
			
			// Reconstruct column with Kings at bottom
			pile.length = 0;
			pile.push(...kings, ...nonKings);
		}
	}

	canPlaceOnTableau(card: Card, targetCard: Card): boolean {
		// Build down regardless of suit
		return card.rank === targetCard.rank - 1;
	}

	canPlaceOnFoundation(card: Card): boolean {
		const foundationIndex = this.suitToIndex(card.suit);
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
		if (!this.canPlaceOnFoundation(card)) return false;
		
		const foundationIndex = this.suitToIndex(card.suit);
		this.foundations[foundationIndex].push(pile.pop()!);
		
		// Record move
		this.moveHistory.push({
			type: 'toFoundation',
			fromCol,
			card: { ...card },
			foundationIndex
		});
		
		return true;
	}

	moveCard(fromCol: number, toCol: number): boolean {
		if (fromCol === toCol) return false;
		
		const fromPile = this.tableau[fromCol];
		if (fromPile.length === 0) return false;

		const card = fromPile[fromPile.length - 1];
		const toPile = this.tableau[toCol];

		// Empty columns CANNOT be filled
		if (toPile.length === 0) return false;

		const targetCard = toPile[toPile.length - 1];
		if (!this.canPlaceOnTableau(card, targetCard)) return false;

		// Move only the top card
		toPile.push(fromPile.pop()!);
		
		// Record move
		this.moveHistory.push({
			type: 'move',
			fromCol,
			toCol,
			card: { ...card }
		});
		
		return true;
	}

	undo(): boolean {
		const lastMove = this.moveHistory.pop();
		if (!lastMove) return false;

		if (lastMove.type === 'move' && lastMove.toCol !== undefined) {
			// Remove card from destination
			const card = this.tableau[lastMove.toCol].pop();
			if (card) {
				// Add back to source
				this.tableau[lastMove.fromCol].push(card);
			}
		} else if (lastMove.type === 'toFoundation' && lastMove.foundationIndex !== undefined) {
			// Remove card from foundation
			const card = this.foundations[lastMove.foundationIndex].pop();
			if (card) {
				// Add back to tableau
				this.tableau[lastMove.fromCol].push(card);
			}
		}

		return true;
	}

	isWon(): boolean {
		return this.foundations.every(f => f.length === 13);
	}
}
