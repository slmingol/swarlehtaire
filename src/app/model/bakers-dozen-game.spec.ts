import { BakersDDozenGame } from './bakers-dozen-game';
import { CardUtils, Suit, Rank } from './card';

describe('BakersDDozenGame', () => {
	let game: BakersDDozenGame;

	beforeEach(() => {
		game = new BakersDDozenGame();
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize with 13 tableau columns', () => {
			expect(game.tableau.length).toBe(13);
		});

		it('should initialize with 4 foundations', () => {
			expect(game.foundations.length).toBe(4);
		});

		it('should have 4 cards in each column', () => {
			game.tableau.forEach(column => {
				expect(column.length).toBe(4);
			});
		});

		it('should have all cards face-up', () => {
			const allFaceUp = game.tableau.flat().every(card => card.faceUp);
			expect(allFaceUp).toBe(true);
		});

		it('should have all foundations empty', () => {
			game.foundations.forEach(foundation => {
				expect(foundation.length).toBe(0);
			});
		});

		it('should have Kings moved to bottom of columns', () => {
			// Check that any Kings in tableau are at the bottom
			game.tableau.forEach(column => {
				const kingIndex = column.findIndex(c => c.rank === Rank.KING);
				if (kingIndex !== -1) {
					expect(kingIndex).toBe(0); // Should be at bottom
				}
			});
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});
	});

	describe('card placement', () => {
		it('should allow descending rank regardless of suit', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const queen = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN);
			
			expect(game.canPlaceOn(queen, king)).toBe(true);
		});

		it('should allow same suit descending', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			
			expect(game.canPlaceOn(queen, king)).toBe(true);
		});

		it('should reject ascending rank', () => {
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			
			expect(game.canPlaceOn(king, queen)).toBe(false);
		});

		it('should reject same rank', () => {
			const king1 = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const king2 = CardUtils.createCard(Suit.HEARTS, Rank.KING);
			
			expect(game.canPlaceOn(king1, king2)).toBe(false);
		});

		it('should not allow placing on empty column', () => {
			game.tableau[0] = [];
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			
			const result = game.moveCard(1, 0);
			expect(result).toBe(false);
		});
	});

	describe('card movement', () => {
		it('should only allow moving top card', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.HEARTS, Rank.QUEEN),
				CardUtils.createCard(Suit.DIAMONDS, Rank.JACK)
			];
			game.tableau[0].forEach(c => c.faceUp = true);
			
			game.tableau[1] = [CardUtils.createCard(Suit.CLUBS, Rank.QUEEN)];
			game.tableau[1][0].faceUp = true;
			
			// Should move only the Jack (top card)
			const result = game.moveCard(0, 1);
			expect(result).toBe(true);
			expect(game.tableau[0].length).toBe(2);
			expect(game.tableau[1].length).toBe(2);
		});

		it('should not allow moving from empty column', () => {
			game.tableau[0] = [];
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			
			const result = game.moveCard(0, 1);
			expect(result).toBe(false);
		});
	});

	describe('foundation operations', () => {
		it('should allow Ace to empty foundation', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(true);
			expect(game.foundations[0].length).toBe(1);
		});

		it('should allow sequential same-suit card', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.TWO)];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(true);
			expect(game.foundations[0].length).toBe(2);
		});

		it('should reject non-Ace to empty foundation', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(false);
		});

		it('should reject different suit', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[0] = [CardUtils.createCard(Suit.HEARTS, Rank.TWO)];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(false);
		});

		it('should reject non-sequential rank', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.THREE)];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(false);
		});
	});

	describe('undo functionality', () => {
		it('should undo tableau move', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.HEARTS, Rank.QUEEN)];
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			
			game.moveCard(0, 1);
			game.undo();
			
			expect(game.tableau[0].length).toBe(1);
			expect(game.tableau[1].length).toBe(1);
		});

		it('should undo foundation move', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			
			game.moveToFoundation(0);
			game.undo();
			
			expect(game.tableau[0].length).toBe(1);
			expect(game.foundations[0].length).toBe(0);
		});

		it('should track multiple undos', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[1] = [CardUtils.createCard(Suit.HEARTS, Rank.ACE)];
			
			game.moveToFoundation(0);
			game.moveToFoundation(1);
			
			expect(game.moveCount).toBe(2);
			
			game.undo();
			expect(game.moveCount).toBe(1);
			
			game.undo();
			expect(game.moveCount).toBe(0);
		});
	});

	describe('win condition', () => {
		it('should not be won initially', () => {
			expect(game.isWon()).toBe(false);
		});

		it('should be won when all foundations complete', () => {
			// Fill all foundations
			const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
			for (let i = 0; i < 4; i++) {
				game.foundations[i] = [];
				for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
					game.foundations[i].push(CardUtils.createCard(suits[i], rank));
				}
			}
			
			expect(game.isWon()).toBe(true);
		});

		it('should not be won with incomplete foundations', () => {
			// Fill 3 foundations completely
			const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
			for (let i = 0; i < 3; i++) {
				game.foundations[i] = [];
				for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
					game.foundations[i].push(CardUtils.createCard(suits[i], rank));
				}
			}
			
			// Leave 4th foundation incomplete
			game.foundations[3] = [CardUtils.createCard(Suit.CLUBS, Rank.ACE)];
			
			expect(game.isWon()).toBe(false);
		});
	});
});
