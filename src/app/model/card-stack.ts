import { Card, CardColor, CardUtils, Rank } from './card';

/**
 * Types of card stacks in solitaire games
 */
export enum StackType {
	STOCK = 'stock',           // Draw pile
	WASTE = 'waste',           // Discard pile
	FOUNDATION = 'foundation', // Building piles (suit-specific, Ace to King)
	TABLEAU = 'tableau'        // Main playing area
}

/**
 * Represents a stack/pile of cards
 */
export class CardStack {
	public cards: Card[] = [];
	public readonly type: StackType;
	public readonly index: number; // For multiple stacks of same type

	constructor(type: StackType, index = 0) {
		this.type = type;
		this.index = index;
	}

	/**
	 * Add a card to the top of the stack
	 */
	push(card: Card): void {
		this.cards.push(card);
	}

	/**
	 * Remove and return the top card
	 */
	pop(): Card | undefined {
		return this.cards.pop();
	}

	/**
	 * Peek at the top card without removing it
	 */
	peek(): Card | undefined {
		return this.cards.length > 0 ? this.cards[this.cards.length - 1] : undefined;
	}

	/**
	 * Get card at specific index
	 */
	getCard(index: number): Card | undefined {
		return this.cards[index];
	}

	/**
	 * Get all cards from index to end
	 */
	getCardsFrom(index: number): Card[] {
		return this.cards.slice(index);
	}

	/**
	 * Remove cards from index to end
	 */
	removeCardsFrom(index: number): Card[] {
		return this.cards.splice(index);
	}

	/**
	 * Add multiple cards to the stack
	 */
	addCards(cards: Card[]): void {
		this.cards.push(...cards);
	}

	/**
	 * Get the number of cards in the stack
	 */
	get count(): number {
		return this.cards.length;
	}

	/**
	 * Check if stack is empty
	 */
	get isEmpty(): boolean {
		return this.cards.length === 0;
	}

	/**
	 * Clear all cards from the stack
	 */
	clear(): void {
		this.cards = [];
	}

	/**
	 * Get all face-up cards from bottom to top
	 */
	getFaceUpCards(): Card[] {
		const faceUpIndex = this.cards.findIndex(card => card.faceUp);
		return faceUpIndex >= 0 ? this.cards.slice(faceUpIndex) : [];
	}

	/**
	 * Count face-up cards
	 */
	get faceUpCount(): number {
		return this.cards.filter(card => card.faceUp).length;
	}

	/**
	 * Klondike-specific: Can this card be placed on this foundation?
	 */
	canPlaceOnFoundation(card: Card): boolean {
		if (this.type !== StackType.FOUNDATION) {
			return false;
		}

		// Empty foundation accepts Aces
		if (this.isEmpty) {
			return card.rank === Rank.ACE;
		}

		const topCard = this.peek();
		if (!topCard) {
			return false;
		}

		// Must be same suit and one rank higher
		return card.suit === topCard.suit && CardUtils.isOneMore(card.rank, topCard.rank);
	}

	/**
	 * Klondike-specific: Can this card be placed on this tableau?
	 */
	canPlaceOnTableau(card: Card): boolean {
		if (this.type !== StackType.TABLEAU) {
			return false;
		}

		// Empty tableau accepts Kings
		if (this.isEmpty) {
			return card.rank === Rank.KING;
		}

		const topCard = this.peek();
		if (!topCard || !topCard.faceUp) {
			return false;
		}

		// Must be opposite color and one rank lower
		return CardUtils.areOppositeColors(card, topCard) &&
			   CardUtils.isOneLess(card.rank, topCard.rank);
	}
}
