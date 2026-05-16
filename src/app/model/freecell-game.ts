import { Card, Suit, Rank, CardUtils } from './card';
import { Deck } from './deck';

/**
 * FreeCell Solitaire Game
 * 
 * - 1 deck (52 cards), all face-up from start
 * - 8 cascades: 4 with 7 cards, 4 with 6 cards  
 * - 4 free cells (temporary storage)
 * - 4 foundations (Ace to King by suit)
 * - Build down by alternating colors
 * - Build up by suit on foundations
 * - ~99.999% of games are solvable
 */
export class FreeCellGame {
	public cascades: Card[][];
	public cells: (Card | null)[];
	public foundations: Card[][];
	public moveHistory: any[];

	constructor() {
		this.cascades = Array.from({ length: 8 }, () => []);
		this.cells = Array.from({ length: 4 }, () => null);
		this.foundations = Array.from({ length: 4 }, () => []);
		this.moveHistory = [];
		this.newGame();
	}

	/**
	 * Start a new game
	 */
	newGame(): void {
		// Clear all piles
		this.cascades.forEach(pile => pile.length = 0);
		this.cells.fill(null);
		this.foundations.forEach(pile => pile.length = 0);
		this.moveHistory.length = 0;

		// Create and shuffle deck
		const deck = new Deck();
		deck.shuffle();

		// Deal all cards face-up to 8 cascades
		// First 4 cascades get 7 cards, last 4 get 6 cards
		let cardIndex = 0;
		for (let cascade = 0; cascade < 8; cascade++) {
			const count = cascade < 4 ? 7 : 6;
			for (let i = 0; i < count; i++) {
				const card = deck.deal();
				if (card) {
					card.faceUp = true;
					this.cascades[cascade].push(card);
				}
			}
		}
	}

	/**
	 * Get number of empty cells
	 */
	get emptyCells(): number {
		return this.cells.filter(cell => cell === null).length;
	}

	/**
	 * Get number of empty cascades
	 */
	get emptyCascades(): number {
		return this.cascades.filter(cascade => cascade.length === 0).length;
	}

	/**
	 * Calculate max cards that can be moved as a sequence
	 * Formula: C = 2^M × (N+1)
	 * M = empty cascades, N = empty cells
	 */
	getMaxMoveSize(toEmptyCascade = false): number {
		const M = toEmptyCascade ? this.emptyCascades - 1 : this.emptyCascades;
		const N = this.emptyCells;
		return Math.pow(2, Math.max(0, M)) * (N + 1);
	}

	/**
	 * Check if card can be moved to foundation
	 */
	canMoveToFoundation(card: Card): boolean {
		const foundationIndex = this.getFoundationIndex(card.suit);
		const foundation = this.foundations[foundationIndex];

		if (foundation.length === 0) {
			return card.rank === Rank.ACE;
		}

		const topCard = foundation[foundation.length - 1];
		return card.suit === topCard.suit && card.rank === topCard.rank + 1;
	}

	/**
	 * Move card to foundation
	 */
	moveToFoundation(card: Card, from: 'cell' | 'cascade', fromIndex: number): boolean {
		if (!this.canMoveToFoundation(card)) return false;

		const foundationIndex = this.getFoundationIndex(card.suit);
		
		// Remove from source
		if (from === 'cell') {
			if (this.cells[fromIndex] !== card) return false;
			this.cells[fromIndex] = null;
		} else {
			const cascade = this.cascades[fromIndex];
			if (cascade[cascade.length - 1] !== card) return false;
			cascade.pop();
		}

		// Add to foundation
		this.foundations[foundationIndex].push(card);
		return true;
	}

	/**
	 * Check if card can be placed on cascade
	 */
	canPlaceOnCascade(card: Card, cascade: Card[]): boolean {
		if (cascade.length === 0) return true;

		const topCard = cascade[cascade.length - 1];
		return CardUtils.areOppositeColors(card, topCard) && 
		       card.rank === topCard.rank - 1;
	}

	/**
	 * Check if a sequence of cards is valid (descending, alternating colors)
	 */
	isValidSequence(cards: Card[]): boolean {
		if (cards.length <= 1) return true;

		for (let i = 1; i < cards.length; i++) {
			if (!CardUtils.areOppositeColors(cards[i-1], cards[i])) return false;
			if (cards[i].rank !== cards[i-1].rank - 1) return false;
		}
		return true;
	}

	/**
	 * Move cards from one cascade to another
	 */
	moveCascade(fromIndex: number, cardIndex: number, toIndex: number): boolean {
		if (fromIndex === toIndex) return false;

		const sourceCascade = this.cascades[fromIndex];
		const targetCascade = this.cascades[toIndex];

		if (cardIndex < 0 || cardIndex >= sourceCascade.length) return false;

		// Get cards to move
		const cardsToMove = sourceCascade.slice(cardIndex);
		
		// Check if it's a valid sequence
		if (!this.isValidSequence(cardsToMove)) return false;

		// Check if we can move this many cards
		const isToEmpty = targetCascade.length === 0;
		const maxMove = this.getMaxMoveSize(isToEmpty);
		if (cardsToMove.length > maxMove) return false;

		// Check if top card can be placed on target
		if (!this.canPlaceOnCascade(cardsToMove[0], targetCascade)) return false;

		// Move the cards
		sourceCascade.splice(cardIndex);
		targetCascade.push(...cardsToMove);
		return true;
	}

	/**
	 * Move card to free cell
	 */
	moveToCell(from: 'cascade', fromIndex: number, cellIndex: number): boolean {
		if (this.cells[cellIndex] !== null) return false;

		const sourceCascade = this.cascades[fromIndex];
		if (sourceCascade.length === 0) return false;

		const card = sourceCascade.pop()!;
		this.cells[cellIndex] = card;
		return true;
	}

	/**
	 * Move card from cell to cascade
	 */
	moveCellToCascade(cellIndex: number, cascadeIndex: number): boolean {
		const card = this.cells[cellIndex];
		if (card === null) return false;

		const targetCascade = this.cascades[cascadeIndex];
		if (!this.canPlaceOnCascade(card, targetCascade)) return false;

		this.cells[cellIndex] = null;
		targetCascade.push(card);
		return true;
	}

	/**
	 * Get foundation index for suit (Spades=0, Hearts=1, Clubs=2, Diamonds=3)
	 */
	private getFoundationIndex(suit: Suit): number {
		const order = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
		return order.indexOf(suit);
	}

	/**
	 * Auto-move cards to foundations
	 */
	autoMoveToFoundations(): number {
		let moved = 0;

		// Try to move from cells
		for (let i = 0; i < 4; i++) {
			const card = this.cells[i];
			if (card && this.canMoveToFoundation(card)) {
				this.moveToFoundation(card, 'cell', i);
				moved++;
			}
		}

		// Try to move from cascades
		for (let i = 0; i < 8; i++) {
			const cascade = this.cascades[i];
			if (cascade.length > 0) {
				const card = cascade[cascade.length - 1];
				if (this.canMoveToFoundation(card)) {
					this.moveToFoundation(card, 'cascade', i);
					moved++;
				}
			}
		}

		return moved;
	}

	/**
	 * Check if game is won
	 */
	isWon(): boolean {
		return this.foundations.every(f => f.length === 13);
	}

	/**
	 * Get move count (foundation cards + cards in cells)
	 */
	get moveCount(): number {
		return this.foundations.reduce((sum, f) => sum + f.length, 0);
	}
}
