import { Card } from './card';
import { CardStack, StackType } from './card-stack';
import { Deck } from './deck';

/**
 * Game variants
 */
export enum GameVariant {
	KLONDIKE_DRAW_3 = 'Klondike (Draw 3)',
	KLONDIKE_DRAW_1 = 'Klondike (Draw 1)',
	EASTHAVEN = 'Easthaven',
	WESTCLIFF = 'Westcliff'
}

/**
 * Game configuration
 */
export interface GameConfig {
	variant: GameVariant;
	drawCount: number;
	tableauCount: number;
	allFaceUp: boolean;
}

/**
 * Move history for undo functionality
 */
export interface Move {
	from: CardStack;
	to: CardStack;
	cards: Card[];
	fromFaceUp: boolean; // Was the card below face-up before move?
}

/**
 * Klondike Solitaire Game
 * 
 * Classic solitaire with:
 * - 7 tableau piles (1-7 cards, top card face-up)
 * - 4 foundation piles (build Ace to King by suit)
 * - Stock pile (remaining cards, face-down)
 * - Waste pile (drawn cards, face-up)
 */
export class KlondikeGame {
	// Game stacks
	public stock: CardStack;
	public waste: CardStack;
	public foundations: CardStack[];
	public tableau: CardStack[];

	// Move history for undo
	private moveHistory: Move[] = [];

	// Game state
	private deck: Deck;
	public moves = 0;
	public startTime: number | null = null;
	public config: GameConfig;

	/**
	 * Get the number of moves that can be undone
	 */
	get canUndo(): boolean {
		return this.moveHistory.length > 0;
	}

	/**
	 * Get the move count
	 */
	get moveCount(): number {
		return this.moveHistory.length;
	}

	constructor(variant: GameVariant = GameVariant.KLONDIKE_DRAW_3) {
		this.deck = new Deck();
		this.config = this.getConfigForVariant(variant);
		
		// Initialize stacks
		this.stock = new CardStack(StackType.STOCK);
		this.waste = new CardStack(StackType.WASTE);
		this.foundations = Array.from({ length: 4 }, (_, i) => 
			new CardStack(StackType.FOUNDATION, i)
		);
		this.tableau = Array.from({ length: this.config.tableauCount }, (_, i) => 
			new CardStack(StackType.TABLEAU, i)
		);

		this.newGame();
	}

	private getConfigForVariant(variant: GameVariant): GameConfig {
		switch (variant) {
			case GameVariant.KLONDIKE_DRAW_1:
				return { variant, drawCount: 1, tableauCount: 7, allFaceUp: false };
			case GameVariant.EASTHAVEN:
				return { variant, drawCount: 3, tableauCount: 7, allFaceUp: true };
			case GameVariant.WESTCLIFF:
				return { variant, drawCount: 1, tableauCount: 10, allFaceUp: false };
			case GameVariant.KLONDIKE_DRAW_3:
			default:
				return { variant, drawCount: 3, tableauCount: 7, allFaceUp: false };
		}
	}

	/**
	 * Start a new game
	 */
	newGame(): void {
		// Reset all stacks
		this.stock.clear();
		this.waste.clear();
		this.foundations.forEach(f => f.clear());
		this.tableau.forEach(t => t.clear());

		// Reset game state
		this.moveHistory = [];
		this.moves = 0;
		this.startTime = Date.now();

		// Shuffle and deal
		this.deck.reset();
		this.deck.shuffle();
		this.deal();
	}

	/**
	 * Deal cards to tableau
	 */
	private deal(): void {
		const tableauCount = this.config.tableauCount;
		
		// Westcliff uses a different deal pattern
		if (this.config.variant === GameVariant.WESTCLIFF) {
			// American Westcliff: 3 cards to each of 10 piles, only top card face-up
			for (let pile = 0; pile < tableauCount; pile++) {
				for (let cardNum = 0; cardNum < 3; cardNum++) {
					const card = this.deck.deal();
					if (card) {
						card.faceUp = (cardNum === 2); // Only the third (top) card face-up
						this.tableau[pile].push(card);
					}
				}
			}
		} else {
			// Standard Klondike/Easthaven: pyramid deal (1, 2, 3, ..., n cards)
			for (let i = 0; i < tableauCount; i++) {
				for (let j = i; j < tableauCount; j++) {
					const card = this.deck.deal();
					if (card) {
						// Face-up logic depends on variant
						if (this.config.allFaceUp) {
							card.faceUp = true; // All cards face-up (Easthaven)
						} else {
							card.faceUp = (i === j); // Only top card face-up (Klondike)
						}
						this.tableau[j].push(card);
					}
				}
			}
		}

		// Remaining cards go to stock (face-down)
		while (!this.deck.isEmpty) {
			const card = this.deck.deal();
			if (card) {
				card.faceUp = false;
				this.stock.push(card);
			}
		}
	}

	/**
	 * Draw card(s) from stock to waste
	 */
	drawFromStock(): boolean {
		if (this.stock.isEmpty) {
			// If stock is empty, move waste back to stock
			if (this.waste.isEmpty) {
				return false;
			}
			while (!this.waste.isEmpty) {
				const card = this.waste.pop();
				if (card) {
					card.faceUp = false;
					this.stock.push(card);
				}
			}
			// Immediately draw cards after reset
			const drawCount = Math.min(this.config.drawCount, this.stock.count);
			for (let i = 0; i < drawCount; i++) {
				const card = this.stock.pop();
				if (card) {
					card.faceUp = true;
					this.waste.push(card);
				}
			}
		} else {
			// Draw cards based on variant
			const drawCount = Math.min(this.config.drawCount, this.stock.count);
			for (let i = 0; i < drawCount; i++) {
				const card = this.stock.pop();
				if (card) {
					card.faceUp = true;
					this.waste.push(card);
				}
			}
		}
		
		this.moves++;
		return true;
	}

	/**
	 * Try to move card(s) from one stack to another
	 */
	moveCards(fromStack: CardStack, toStack: CardStack, cardIndex: number): boolean {
		const cards = fromStack.getCardsFrom(cardIndex);
		
		if (cards.length === 0) {
			return false;
		}

		const movingCard = cards[0];

		// Validate move based on stack types
		let canMove = false;

		if (toStack.type === StackType.FOUNDATION) {
			// Only single cards to foundation
			if (cards.length === 1) {
				canMove = toStack.canPlaceOnFoundation(movingCard);
			}
		} else if (toStack.type === StackType.TABLEAU) {
			canMove = toStack.canPlaceOnTableau(movingCard);
		}

		if (!canMove) {
			return false;
		}

		// Execute move
		const movedCards = fromStack.removeCardsFrom(cardIndex);
		
		// Remember if card below was face-up (for undo)
		const cardBelow = fromStack.peek();
		const wasFaceUp = cardBelow ? cardBelow.faceUp : false;

		// Flip top card of source stack if it's tableau and face-down
		if (fromStack.type === StackType.TABLEAU && cardBelow && !cardBelow.faceUp) {
			cardBelow.faceUp = true;
		}

		toStack.addCards(movedCards);

		// Record move for undo
		this.moveHistory.push({
			from: fromStack,
			to: toStack,
			cards: movedCards,
			fromFaceUp: wasFaceUp
		});

		this.moves++;
		return true;
	}

	/**
	 * Undo last move
	 */
	undo(): boolean {
		const lastMove = this.moveHistory.pop();
		if (!lastMove) {
			return false;
		}

		// Move cards back
		const cards = lastMove.to.getCardsFrom(
			lastMove.to.count - lastMove.cards.length
		);
		lastMove.to.removeCardsFrom(lastMove.to.count - lastMove.cards.length);
		lastMove.from.addCards(cards);

		// Restore face-down state if needed
		const cardBelow = lastMove.from.peek();
		if (cardBelow && lastMove.from.type === StackType.TABLEAU) {
			if (!lastMove.fromFaceUp && cardBelow.faceUp) {
				cardBelow.faceUp = false;
			}
		}

		this.moves++;
		return true;
	}

	/**
	 * Check if game is won
	 */
	isWon(): boolean {
		return this.foundations.every(f => f.count === 13);
	}

	/**
	 * Auto-move cards to foundations if safe
	 */
	autoMoveToFoundations(): number {
		let moved = 0;

		// Try waste pile first
		const wasteCard = this.waste.peek();
		if (wasteCard) {
			for (const foundation of this.foundations) {
				if (foundation.canPlaceOnFoundation(wasteCard)) {
					if (this.moveCards(this.waste, foundation, this.waste.count - 1)) {
						moved++;
						break;
					}
				}
			}
		}

		// Try each tableau pile
		for (const tableau of this.tableau) {
			const topCard = tableau.peek();
			if (topCard && topCard.faceUp) {
				for (const foundation of this.foundations) {
					if (foundation.canPlaceOnFoundation(topCard)) {
						if (this.moveCards(tableau, foundation, tableau.count - 1)) {
							moved++;
							break;
						}
					}
				}
			}
		}

		return moved;
	}

	/**
	 * Get game statistics
	 */
	getStats(): { moves: number; time: number; won: boolean } {
		const time = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
		return {
			moves: this.moves,
			time,
			won: this.isWon()
		};
	}
}
