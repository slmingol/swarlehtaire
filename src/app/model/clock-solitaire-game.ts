import { Card, Rank } from './card';
import { Deck } from './deck';

export interface ClockPile {
	faceDown: Card[];
	faceUp: Card[];
}

export class ClockSolitaireGame {
	piles: ClockPile[] = [];
	currentPileIndex = 12;
	lastCard: Card | null = null;
	kingsCount = 0;
	gamePhase: 'playing' | 'won' | 'lost' = 'playing';
	moveCount = 0;

	constructor() {
		this.newGame();
	}

	newGame(): void {
		const deck = new Deck();
		deck.shuffle();
		this.piles = Array.from({ length: 13 }, (): ClockPile => ({ faceDown: [], faceUp: [] }));
		// Deal round-robin: pile 0 gets cards 0,13,26,39 etc.
		for (let i = 0; i < 52; i++) {
			const card = deck.deal()!;
			this.piles[i % 13].faceDown.push(card);
		}
		this.currentPileIndex = 12;
		this.lastCard = null;
		this.kingsCount = 0;
		this.gamePhase = 'playing';
		this.moveCount = 0;
	}

	// Draw the top card from currentPile, route to its rank's pile, advance currentPile.
	step(): boolean {
		if (this.gamePhase !== 'playing') return false;
		const fromPile = this.piles[this.currentPileIndex];
		if (fromPile.faceDown.length === 0) return false;

		const card = fromPile.faceDown.pop()!;
		card.faceUp = true;

		// Ace(1)→pile[0], ..., Queen(12)→pile[11], King(13)→pile[12] (center)
		const destIndex = (card.rank as number) - 1;
		this.piles[destIndex].faceUp.push(card);
		this.lastCard = card;
		this.moveCount++;

		if (card.rank === Rank.KING) {
			this.kingsCount++;
			if (this.kingsCount === 4) {
				const allFaceUp = this.piles.every(p => p.faceDown.length === 0);
				this.gamePhase = allFaceUp ? 'won' : 'lost';
				return true;
			}
		}

		this.currentPileIndex = destIndex;
		return true;
	}

	playAll(): void {
		while (this.gamePhase === 'playing') {
			if (!this.step()) break;
		}
	}

	// pile[0]=Ace, pile[1]=2, ..., pile[11]=Queen, pile[12]=King(center)
	static pileLabel(index: number): string {
		return ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][index];
	}
}
