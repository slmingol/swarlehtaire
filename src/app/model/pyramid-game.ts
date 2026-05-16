import { Card, Rank, CardUtils } from './card';
import { Deck } from './deck';

export interface PyramidMove {
	type: 'removeKing' | 'removePair' | 'removeWithWaste' | 'draw';
	row1?: number;
	col1?: number;
	row2?: number;
	col2?: number;
	cards: Card[];
	previousWaste?: Card | null;
}

export class PyramidGame {
	pyramid: Card[][] = [];
	stock: Card[] = [];
	waste: Card | null = null;
	removed: Card[] = [];
	stockIndex: number = 0;
	moveHistory: PyramidMove[] = [];

	get canUndo(): boolean {
		return this.moveHistory.length > 0;
	}

	get moveCount(): number {
		return this.moveHistory.length;
	}

	constructor() {
		this.deal();
	}

	deal(): void {
		const deck = new Deck();
		deck.shuffle();
		const cards = deck.getCards();

		// Build pyramid: 7 rows (1, 2, 3, 4, 5, 6, 7 = 28 cards)
		this.pyramid = [];
		let cardIndex = 0;
		for (let row = 0; row < 7; row++) {
			const rowCards: Card[] = [];
			for (let col = 0; col <= row; col++) {
				const card = cards[cardIndex++];
				card.faceUp = true;
				rowCards.push(card);
			}
			this.pyramid.push(rowCards);
		}

		// Remaining 24 cards go to stock
		this.stock = cards.slice(28);
		this.waste = null;
		this.removed = [];
		this.stockIndex = 0;
		this.moveHistory = [];
	}

	isCardExposed(row: number, col: number): boolean {
		// Card is exposed if no cards in next row cover it
		if (row === 6) return true; // Bottom row always exposed
		
		const nextRow = this.pyramid[row + 1];
		if (!nextRow) return true;
		
		// Check if covered by cards at positions col and col+1 in next row
		return !nextRow[col] && !nextRow[col + 1];
	}

	canPair(card1: Card, card2: Card): boolean {
		const value1 = this.getCardValue(card1);
		const value2 = this.getCardValue(card2);
		return value1 + value2 === 13;
	}

	getCardValue(card: Card): number {
		switch (card.rank) {
			case Rank.ACE: return 1;
			case Rank.TWO: return 2;
			case Rank.THREE: return 3;
			case Rank.FOUR: return 4;
			case Rank.FIVE: return 5;
			case Rank.SIX: return 6;
			case Rank.SEVEN: return 7;
			case Rank.EIGHT: return 8;
			case Rank.NINE: return 9;
			case Rank.TEN: return 10;
			case Rank.JACK: return 11;
			case Rank.QUEEN: return 12;
			case Rank.KING: return 13;
		}
	}

	removeKing(row: number, col: number): boolean {
		const card = this.pyramid[row][col];
		if (!card) return false;
		if (card.rank !== Rank.KING) return false;
		if (!this.isCardExposed(row, col)) return false;

		this.removed.push(card);
		this.pyramid[row][col] = null!;
		
		this.moveHistory.push({
			type: 'removeKing',
			row1: row,
			col1: col,
			cards: [{ ...card }]
		});
		
		return true;
	}

	removePyramidPair(row1: number, col1: number, row2: number, col2: number): boolean {
		const card1 = this.pyramid[row1][col1];
		const card2 = this.pyramid[row2][col2];
		
		if (!card1 || !card2) return false;
		if (!this.isCardExposed(row1, col1)) return false;
		if (!this.isCardExposed(row2, col2)) return false;
		if (!this.canPair(card1, card2)) return false;

		this.removed.push(card1, card2);
		this.pyramid[row1][col1] = null!;
		this.pyramid[row2][col2] = null!;
		
		this.moveHistory.push({
			type: 'removePair',
			row1,
			col1,
			row2,
			col2,
			cards: [{ ...card1 }, { ...card2 }]
		});
		
		return true;
	}

	removeWastePyramidPair(row: number, col: number): boolean {
		if (!this.waste) return false;
		const pyramidCard = this.pyramid[row][col];
		
		if (!pyramidCard) return false;
		if (!this.isCardExposed(row, col)) return false;
		if (!this.canPair(this.waste, pyramidCard)) return false;

		const wasteCard = this.waste;
		this.removed.push(wasteCard, pyramidCard);
		this.waste = null;
		this.pyramid[row][col] = null!;
		
		this.moveHistory.push({
			type: 'removeWithWaste',
			row1: row,
			col1: col,
			cards: [{ ...wasteCard }, { ...pyramidCard }],
			previousWaste: null
		});
		
		return true;
	}

	drawFromStock(): boolean {
		if (this.stockIndex >= this.stock.length) return false;

		const previousWaste = this.waste ? { ...this.waste } : null;
		const card = this.stock[this.stockIndex];
		card.faceUp = true;
		
		// If waste pairs with new card, auto-remove
		if (this.waste && this.canPair(this.waste, card)) {
			const wasteCard = this.waste;
			this.removed.push(wasteCard, card);
			this.waste = null;
			
			this.moveHistory.push({
				type: 'draw',
				cards: [{ ...wasteCard }, { ...card }],
				previousWaste
			});
		} else {
			this.waste = card;
			
			this.moveHistory.push({
				type: 'draw',
				cards: [{ ...card }],
				previousWaste
			});
		}
		
		this.stockIndex++;
		return true;
	}

	isWon(): boolean {
		// Win if pyramid is completely cleared
		return this.pyramid.every(row => row.every(card => !card));
	}

	isGameOver(): boolean {
		if (this.isWon()) return true;
		
		// Game over if no valid moves
		if (this.stockIndex < this.stock.length) return false; // Can still draw
		
		// Check for valid pyramid pairs
		const exposed: {row: number, col: number, card: Card}[] = [];
		for (let row = 0; row < this.pyramid.length; row++) {
			for (let col = 0; col < this.pyramid[row].length; col++) {
				const card = this.pyramid[row][col];
				if (card && this.isCardExposed(row, col)) {
					if (card.rank === Rank.KING) return false; // Can remove king
					exposed.push({row, col, card});
				}
			}
		}

		// Check all exposed pairs
		for (let i = 0; i < exposed.length; i++) {
			for (let j = i + 1; j < exposed.length; j++) {
				if (this.canPair(exposed[i].card, exposed[j].card)) {
					return false;
				}
			}
		}

		// Check waste with pyramid
		if (this.waste) {
			for (const exp of exposed) {
				if (this.canPair(this.waste, exp.card)) {
					return false;
				}
			}
		}

		return true; // No valid moves
	}

	getRemainingPyramidCount(): number {
		return this.pyramid.reduce((sum, row) => 
			sum + row.filter(card => card !== null).length, 0
		);
	}

	undo(): boolean {
		const lastMove = this.moveHistory.pop();
		if (!lastMove) return false;

		switch (lastMove.type) {
			case 'removeKing':
				// Restore king to pyramid
				if (lastMove.row1 !== undefined && lastMove.col1 !== undefined) {
					this.pyramid[lastMove.row1][lastMove.col1] = lastMove.cards[0];
					this.removed.pop();
				}
				break;
			
			case 'removePair':
				// Restore both pyramid cards
				if (lastMove.row1 !== undefined && lastMove.col1 !== undefined &&
					lastMove.row2 !== undefined && lastMove.col2 !== undefined) {
					this.pyramid[lastMove.row1][lastMove.col1] = lastMove.cards[0];
					this.pyramid[lastMove.row2][lastMove.col2] = lastMove.cards[1];
					this.removed.pop();
					this.removed.pop();
				}
				break;
			
			case 'removeWithWaste':
				// Restore waste and pyramid card
				if (lastMove.row1 !== undefined && lastMove.col1 !== undefined) {
					this.waste = lastMove.cards[0];
					this.pyramid[lastMove.row1][lastMove.col1] = lastMove.cards[1];
					this.removed.pop();
					this.removed.pop();
				}
				break;
			
			case 'draw':
				// Restore previous waste and stock index
				this.stockIndex--;
				this.waste = lastMove.previousWaste || null;
				// Restore cards to removed if they were auto-removed
				if (lastMove.cards.length === 2) {
					this.removed.pop();
					this.removed.pop();
				}
				break;
		}

		return true;
	}
}
