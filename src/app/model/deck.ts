import { Card, CardUtils, Rank, Suit } from './card';

/**
 * Represents a deck of playing cards
 */
export class Deck {
	private cards: Card[] = [];

	constructor() {
		this.initialize();
	}

	/**
	 * Initialize a standard 52-card deck
	 */
	private initialize(): void {
		this.cards = [];
		const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
		const ranks = [
			Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
			Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING
		];

		for (const suit of suits) {
			for (const rank of ranks) {
				this.cards.push(CardUtils.createCard(suit, rank, false));
			}
		}
	}

	/**
	 * Shuffle the deck using Fisher-Yates algorithm
	 */
	shuffle(): void {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	/**
	 * Deal a card from the top of the deck
	 */
	deal(): Card | undefined {
		return this.cards.pop();
	}

	/**
	 * Deal multiple cards
	 */
	dealMultiple(count: number): Card[] {
		const dealt: Card[] = [];
		for (let i = 0; i < count && this.cards.length > 0; i++) {
			const card = this.deal();
			if (card) {
				dealt.push(card);
			}
		}
		return dealt;
	}

	/**
	 * Get the remaining card count
	 */
	get count(): number {
		return this.cards.length;
	}

	/**
	 * Check if deck is empty
	 */
	get isEmpty(): boolean {
		return this.cards.length === 0;
	}

	/**
	 * Reset the deck
	 */
	reset(): void {
		this.initialize();
	}

	/**
	 * Get all cards (for testing/debugging)
	 */
	getCards(): Card[] {
		return [...this.cards];
	}
}
