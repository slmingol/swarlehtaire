import { Card, Suit, Rank } from './card';
import { Deck } from './deck';

export interface YukonMove {
	type: 'move' | 'toFoundation';
	fromCol: number;
	toCol?: number;
	cards: Card[];
	cardIndex?: number;
	fromTopWasFaceUp?: boolean;
	foundationIndex?: number;
}

export class YukonGame {
	tableau: Card[][] = [];
	foundations: Card[][] = [];
	moveHistory: YukonMove[] = [];

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
		
		this.tableau = Array.from({ length: 7 }, () => []);
		this.foundations = Array.from({ length: 4 }, () => []);
		this.moveHistory = [];

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
		if (!card.faceUp || !this.canPlaceOnFoundation(card)) return false;
		
		const foundationIndex = this.suitToIndex(card.suit);
		const fromTopCard = pile[pile.length - 2];
		const fromTopWasFaceUp = fromTopCard ? fromTopCard.faceUp : true;
		
		this.foundations[foundationIndex].push(pile.pop()!);
		
		// Turn over face-down card if exposed
		if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
			pile[pile.length - 1].faceUp = true;
		}
		
		// Record move
		this.moveHistory.push({
			type: 'toFoundation',
			fromCol,
			cards: [{ ...card }],
			fromTopWasFaceUp,
			foundationIndex
		});
		
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

		// Remember if card below was face-up
		const fromTopCard = fromPile[cardIndex - 1];
		const fromTopWasFaceUp = fromTopCard ? fromTopCard.faceUp : true;

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

		// Record move
		this.moveHistory.push({
			type: 'move',
			fromCol,
			toCol,
			cardIndex,
			cards: movingCards.map(c => ({ ...c })),
			fromTopWasFaceUp
		});

		return true;
	}

	undo(): boolean {
		const lastMove = this.moveHistory.pop();
		if (!lastMove) return false;

		if (lastMove.type === 'move' && lastMove.toCol !== undefined && lastMove.cardIndex !== undefined) {
			// Remove cards from destination
			const cardsToMoveBack = this.tableau[lastMove.toCol].splice(-lastMove.cards.length);
			
			// Add cards back to source
			this.tableau[lastMove.fromCol].push(...cardsToMoveBack);

			// Restore face-down state if needed
			if (this.tableau[lastMove.fromCol].length > lastMove.cardIndex) {
				const exposedCard = this.tableau[lastMove.fromCol][lastMove.cardIndex - 1];
				if (exposedCard && !lastMove.fromTopWasFaceUp) {
					exposedCard.faceUp = false;
				}
			}
		} else if (lastMove.type === 'toFoundation' && lastMove.foundationIndex !== undefined) {
			// Remove card from foundation
			const card = this.foundations[lastMove.foundationIndex].pop();
			if (card) {
				// Add back to tableau
				this.tableau[lastMove.fromCol].push(card);

				// Restore face-down state if needed
				const exposedCard = this.tableau[lastMove.fromCol][this.tableau[lastMove.fromCol].length - 2];
				if (exposedCard && !lastMove.fromTopWasFaceUp) {
					exposedCard.faceUp = false;
				}
			}
		}

		return true;
	}

	isWon(): boolean {
		return this.foundations.every(f => f.length === 13);
	}
}
