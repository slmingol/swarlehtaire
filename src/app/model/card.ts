/**
 * Card suits in a standard deck
 */
export enum Suit {
	HEARTS = 'hearts',
	DIAMONDS = 'diamonds',
	CLUBS = 'clubs',
	SPADES = 'spades'
}

/**
 * Card ranks from Ace to King
 */
export enum Rank {
	ACE = 1,
	TWO = 2,
	THREE = 3,
	FOUR = 4,
	FIVE = 5,
	SIX = 6,
	SEVEN = 7,
	EIGHT = 8,
	NINE = 9,
	TEN = 10,
	JACK = 11,
	QUEEN = 12,
	KING = 13
}

/**
 * Card colors
 */
export enum CardColor {
	RED = 'red',
	BLACK = 'black'
}

/**
 * Represents a playing card
 */
export interface Card {
	suit: Suit;
	rank: Rank;
	faceUp: boolean;
	id: string; // Unique identifier for the card
}

/**
 * Helper functions for card operations
 */
export class CardUtils {
	/**
	 * Get the color of a suit
	 */
	static getSuitColor(suit: Suit): CardColor {
		return suit === Suit.HEARTS || suit === Suit.DIAMONDS
			? CardColor.RED
			: CardColor.BLACK;
	}

	/**
	 * Get the color of a card
	 */
	static getCardColor(card: Card): CardColor {
		return this.getSuitColor(card.suit);
	}

	/**
	 * Check if two cards have opposite colors
	 */
	static areOppositeColors(card1: Card, card2: Card): boolean {
		return this.getCardColor(card1) !== this.getCardColor(card2);
	}

	/**
	 * Check if rank1 is one less than rank2
	 */
	static isOneLess(rank1: Rank, rank2: Rank): boolean {
		return rank1 === rank2 - 1;
	}

	/**
	 * Check if rank1 is one more than rank2
	 */
	static isOneMore(rank1: Rank, rank2: Rank): boolean {
		return rank1 === rank2 + 1;
	}

	/**
	 * Get display name for rank
	 */
	static getRankName(rank: Rank): string {
		const names: Record<Rank, string> = {
			[Rank.ACE]: 'A',
			[Rank.TWO]: '2',
			[Rank.THREE]: '3',
			[Rank.FOUR]: '4',
			[Rank.FIVE]: '5',
			[Rank.SIX]: '6',
			[Rank.SEVEN]: '7',
			[Rank.EIGHT]: '8',
			[Rank.NINE]: '9',
			[Rank.TEN]: '10',
			[Rank.JACK]: 'J',
			[Rank.QUEEN]: 'Q',
			[Rank.KING]: 'K'
		};
		return names[rank];
	}

	/**
	 * Get display symbol for suit
	 */
	static getSuitSymbol(suit: Suit): string {
		const symbols: Record<Suit, string> = {
			[Suit.HEARTS]: '♥',
			[Suit.DIAMONDS]: '♦',
			[Suit.CLUBS]: '♣',
			[Suit.SPADES]: '♠'
		};
		return symbols[suit];
	}

	/**
	 * Create a unique ID for a card
	 */
	static createCardId(suit: Suit, rank: Rank): string {
		return `${suit}-${rank}`;
	}

	/**
	 * Create a new card
	 */
	static createCard(suit: Suit, rank: Rank, faceUp = false): Card {
		return {
			suit,
			rank,
			faceUp,
			id: this.createCardId(suit, rank)
		};
	}
}
