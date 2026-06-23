import { Card, Rank } from './card';
import { Deck } from './deck';

export interface ClockPile {
	faceDown: Card[];
	faceUp: Card[];  // last element is always the pending card when this is currentPileIndex
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
		for (let i = 0; i < 52; i++) {
			const card = deck.deal()!;
			this.piles[i % 13].faceDown.push(card);
		}
		this.currentPileIndex = 12;
		this.lastCard = null;
		this.kingsCount = 0;
		this.gamePhase = 'playing';
		this.moveCount = 0;

		// Pre-reveal the first card at the King pile so the user sees a face-up card at center.
		const first = this.piles[12].faceDown.pop()!;
		first.faceUp = true;
		this.piles[12].faceUp.push(first);
	}

	// Each step: place the pending face-up card from currentPile at its rank's pile,
	// then reveal the next face-down card there (making it the new pending card).
	step(): boolean {
		if (this.gamePhase !== 'playing') return false;

		const fromPile = this.piles[this.currentPileIndex];
		if (fromPile.faceUp.length === 0) return false;

		// Take the pending (top face-up) card and route it to its rank's pile.
		const card = fromPile.faceUp.pop()!;
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

		// Reveal the next face-down card at the destination; it becomes the new pending card.
		this.currentPileIndex = destIndex;
		const nextCard = this.piles[destIndex].faceDown.pop()!;
		nextCard.faceUp = true;
		this.piles[destIndex].faceUp.push(nextCard);

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
