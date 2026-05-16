import { Card, Suit, Rank, CardUtils } from './card';
import { Deck } from './deck';

/**
 * Spider variant difficulty
 */
export enum SpiderVariant {
	ONE_SUIT = 'Spider (1 Suit)',
	TWO_SUIT = 'Spider (2 Suits)',
	FOUR_SUIT = 'Spider (4 Suits)'
}

/**
 * Spider Solitaire Game
 * 
 * Uses 2 decks (104 cards)
 * - 10 tableau piles
 * - Build down by rank (any suit)
 * - Move in-suit sequences together
 * - Complete K-A sequences are removed
 * - 8 sequences needed to win
 */
export class SpiderGame {
	public tableau: Card[][];
	public stock: Card[];
	public completed: Card[][]; // Completed sequences (K-A)
	public moveHistory: any[];
	private variant: SpiderVariant;

	constructor(variant: SpiderVariant = SpiderVariant.FOUR_SUIT) {
		this.variant = variant;
		this.tableau = Array.from({ length: 10 }, () => []);
		this.stock = [];
		this.completed = [];
		this.moveHistory = [];
		this.newGame();
	}

	/**
	 * Start a new game
	 */
	newGame(): void {
		// Clear all piles
		this.tableau.forEach(pile => pile.length = 0);
		this.stock.length = 0;
		this.completed.length = 0;
		this.moveHistory.length = 0;

		// Create 2 decks based on variant
		const cards = this.createDeck();
		this.shuffleArray(cards);

		// Deal to tableau: first 4 piles get 6 cards, last 6 piles get 5 cards
		let cardIndex = 0;
		for (let pile = 0; pile < 10; pile++) {
			const count = pile < 4 ? 6 : 5;
			for (let i = 0; i < count; i++) {
				const card = cards[cardIndex++];
				card.faceUp = (i === count - 1); // Only top card face-up
				this.tableau[pile].push(card);
			}
		}

		// Remaining 50 cards go to stock
		this.stock = cards.slice(cardIndex).map(card => {
			card.faceUp = false;
			return card;
		});
	}

	/**
	 * Create deck based on variant
	 */
	private createDeck(): Card[] {
		const cards: Card[] = [];
		let idCounter = 0;

		for (let deckNum = 0; deckNum < 2; deckNum++) {
			for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
				// Generate suits based on variant
				let suits: Suit[];
				switch (this.variant) {
					case SpiderVariant.ONE_SUIT:
						suits = [Suit.SPADES]; // All spades
						break;
					case SpiderVariant.TWO_SUIT:
						suits = [Suit.SPADES, Suit.HEARTS]; // Spades and hearts only
						break;
					case SpiderVariant.FOUR_SUIT:
					default:
						suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
						break;
				}

				// For 1-suit and 2-suit, we need to create multiple cards per suit
				if (this.variant === SpiderVariant.ONE_SUIT) {
					// 8 cards of each rank, all spades
					for (let i = 0; i < 8; i++) {
						const card = CardUtils.createCard(Suit.SPADES, rank, false);
						card.id = `${card.id}-${idCounter++}`;
						cards.push(card);
					}
				} else if (this.variant === SpiderVariant.TWO_SUIT) {
					// 4 of each rank in each of the 2 suits
					for (const suit of suits) {
						for (let i = 0; i < 4; i++) {
							const card = CardUtils.createCard(suit, rank, false);
							card.id = `${card.id}-${idCounter++}`;
							cards.push(card);
						}
					}
				} else {
					// 2 of each rank in each of the 4 suits
					for (const suit of suits) {
						for (let i = 0; i < 2; i++) {
							const card = CardUtils.createCard(suit, rank, false);
							card.id = `${card.id}-${idCounter++}`;
							cards.push(card);
						}
					}
				}
			}
		}

		return cards;
	}

	/**
	 * Fisher-Yates shuffle
	 */
	private shuffleArray<T>(array: T[]): void {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	/**
	 * Can move cards from one pile to another
	 */
	canMove(fromPile: number, fromIndex: number, toPile: number): boolean {
		if (fromPile === toPile) return false;
		if (fromPile < 0 || fromPile >= 10) return false;
		if (toPile < 0 || toPile >= 10) return false;

		const sourcePile = this.tableau[fromPile];
		const targetPile = this.tableau[toPile];

		if (fromIndex < 0 || fromIndex >= sourcePile.length) return false;
		if (!sourcePile[fromIndex].faceUp) return false;

		// Check if cards being moved form a valid sequence
		const cardsToMove = sourcePile.slice(fromIndex);
		if (!this.isValidSequence(cardsToMove)) return false;

		const topCard = cardsToMove[0];

		// Can move to empty pile
		if (targetPile.length === 0) return true;

		// Must build down by rank
		const targetCard = targetPile[targetPile.length - 1];
		return topCard.rank === targetCard.rank - 1;
	}

	/**
	 * Check if cards form a valid descending sequence in same suit
	 */
	private isValidSequence(cards: Card[]): boolean {
		if (cards.length === 0) return false;
		if (cards.length === 1) return true;

		const suit = cards[0].suit;
		for (let i = 1; i < cards.length; i++) {
			if (cards[i].suit !== suit) return false;
			if (cards[i].rank !== cards[i - 1].rank - 1) return false;
		}
		return true;
	}

	/**
	 * Move cards from one pile to another
	 */
	moveCards(fromPile: number, fromIndex: number, toPile: number): boolean {
		if (!this.canMove(fromPile, fromIndex, toPile)) return false;

		const sourcePile = this.tableau[fromPile];
		const targetPile = this.tableau[toPile];

		const cardsToMove = sourcePile.splice(fromIndex);
		targetPile.push(...cardsToMove);

		// Turn over new top card in source pile
		if (sourcePile.length > 0) {
			sourcePile[sourcePile.length - 1].faceUp = true;
		}

		// Check for completed sequences
		this.checkAndRemoveCompletedSequences();

		return true;
	}

	/**
	 * Check all piles for completed K-A sequences and remove them
	 */
	private checkAndRemoveCompletedSequences(): void {
		for (let pileIndex = 0; pileIndex < 10; pileIndex++) {
			const pile = this.tableau[pileIndex];
			if (pile.length < 13) continue;

			// Check from the end of the pile
			for (let startIndex = pile.length - 13; startIndex >= 0; startIndex--) {
				if (!pile[startIndex].faceUp) continue;

				const sequence = pile.slice(startIndex, startIndex + 13);
				
				// Check if it's a complete K-A sequence in same suit
				if (this.isCompleteSequence(sequence)) {
					// Remove the sequence
					const removed = pile.splice(startIndex, 13);
					this.completed.push(removed);

					// Turn over new top card
					if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
						pile[pile.length - 1].faceUp = true;
					}

					// Check again in case there are multiple sequences
					this.checkAndRemoveCompletedSequences();
					return;
				}
			}
		}
	}

	/**
	 * Check if sequence is complete K-A in same suit
	 */
	private isCompleteSequence(cards: Card[]): boolean {
		if (cards.length !== 13) return false;
		
		const suit = cards[0].suit;
		if (cards[0].rank !== Rank.KING) return false;

		for (let i = 0; i < 13; i++) {
			if (cards[i].suit !== suit) return false;
			if (cards[i].rank !== Rank.KING - i) return false;
		}

		return true;
	}

	/**
	 * Deal 10 cards from stock (one to each pile)
	 */
	dealFromStock(): boolean {
		// Can't deal if any pile is empty
		for (const pile of this.tableau) {
			if (pile.length === 0) return false;
		}

		// Can't deal if stock is empty
		if (this.stock.length < 10) return false;

		// Deal one card to each pile
		for (let i = 0; i < 10; i++) {
			const card = this.stock.pop()!;
			card.faceUp = true;
			this.tableau[i].push(card);
		}

		// Check for completed sequences after dealing
		this.checkAndRemoveCompletedSequences();

		return true;
	}

	/**
	 * Check if game is won
	 */
	isWon(): boolean {
		return this.completed.length === 8;
	}

	/**
	 * Get stock count
	 */
	get stockCount(): number {
		return this.stock.length;
	}

	/**
	 * Get completed count
	 */
	get completedCount(): number {
		return this.completed.length;
	}
}
