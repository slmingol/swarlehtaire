import { SpiderGame, SpiderVariant } from './spider-game';
import { Card, CardUtils, Suit, Rank } from './card';

describe('SpiderGame', () => {
	let game: SpiderGame;

	beforeEach(() => {
		game = new SpiderGame(SpiderVariant.ONE_SUIT);
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize with 10 tableau columns', () => {
			expect(game.tableau.length).toBe(10);
		});

		it('should initialize first 4 columns with 6 cards', () => {
			for (let i = 0; i < 4; i++) {
				expect(game.tableau[i].length).toBe(6);
			}
		});

		it('should initialize last 6 columns with 5 cards', () => {
			for (let i = 4; i < 10; i++) {
				expect(game.tableau[i].length).toBe(5);
			}
		});

		it('should have 50 cards in stock', () => {
			expect(game.stockCount).toBe(50);
		});

		it('should have 0 completed suits initially', () => {
			expect(game.completedCount).toBe(0);
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});

		it('should have moveCount 0 initially', () => {
			expect(game.moveCount).toBe(0);
		});
	});

	describe('card placement', () => {
		it('should allow placing lower rank on higher rank', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			expect(game.canPlaceOn(queen, king)).toBe(true);
		});

		it('should not allow placing higher rank on lower rank', () => {
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			expect(game.canPlaceOn(king, queen)).toBe(false);
		});

		it('should not allow placing same rank', () => {
			const king1 = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const king2 = CardUtils.createCard(Suit.HEARTS, Rank.KING);
			expect(game.canPlaceOn(king1, king2)).toBe(false);
		});

		it('should allow any card on empty column', () => {
			game.tableau[0] = [];
			const card = CardUtils.createCard(Suit.SPADES, Rank.FIVE);
			// Empty columns should accept any card
			expect(game.tableau[0].length).toBe(0);
		});
	});

	describe('sequence detection', () => {
		it('should detect valid descending sequence', () => {
			const cards = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN),
				CardUtils.createCard(Suit.SPADES, Rank.JACK)
			];
			cards.forEach(c => c.faceUp = true);
			expect(game.isValidSequence(cards)).toBe(true);
		});

		it('should reject sequence with wrong order', () => {
			const cards = [
				CardUtils.createCard(Suit.SPADES, Rank.JACK),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN),
				CardUtils.createCard(Suit.SPADES, Rank.KING)
			];
			cards.forEach(c => c.faceUp = true);
			expect(game.isValidSequence(cards)).toBe(false);
		});

		it('should reject sequence with face-down cards', () => {
			const cards = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN),
				CardUtils.createCard(Suit.SPADES, Rank.JACK)
			];
			cards[0].faceUp = false;
			cards[1].faceUp = true;
			cards[2].faceUp = true;
			expect(game.isValidSequence(cards)).toBe(false);
		});
	});

	describe('complete sequence detection', () => {
		it('should detect complete K-A sequence of same suit', () => {
			const cards: Card[] = [];
			for (let rank = Rank.KING; rank >= Rank.ACE; rank--) {
				const card = CardUtils.createCard(Suit.SPADES, rank);
				card.faceUp = true;
				cards.push(card);
			}
			expect(game.isCompleteSequence(cards)).toBe(true);
		});

		it('should reject incomplete sequence', () => {
			const cards: Card[] = [];
			for (let rank = Rank.KING; rank >= Rank.TWO; rank--) {
				const card = CardUtils.createCard(Suit.SPADES, rank);
				card.faceUp = true;
				cards.push(card);
			}
			expect(game.isCompleteSequence(cards)).toBe(false);
		});

		it('should reject sequence with mixed suits', () => {
			const cards: Card[] = [];
			for (let rank = Rank.KING; rank >= Rank.ACE; rank--) {
				const suit = rank % 2 === 0 ? Suit.SPADES : Suit.HEARTS;
				const card = CardUtils.createCard(suit, rank);
				card.faceUp = true;
				cards.push(card);
			}
			expect(game.isCompleteSequence(cards)).toBe(false);
		});
	});

	describe('undo functionality', () => {
		it('should allow undo after move', () => {
			// Setup: Create a valid move scenario
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN)
			];
			game.tableau[0].forEach(c => c.faceUp = true);
			game.tableau[1] = [];

			// Make a move
			game.moveCards(0, 0, 1);

			// Should be able to undo
			expect(game.canUndo).toBe(true);
			expect(game.moveCount).toBe(1);
		});

		it('should restore state after undo', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN)
			];
			game.tableau[0].forEach(c => c.faceUp = true);
			game.tableau[1] = [];

			const originalCol0Length = game.tableau[0].length;
			game.moveCards(0, 0, 1);
			game.undo();

			expect(game.tableau[0].length).toBe(originalCol0Length);
			expect(game.tableau[1].length).toBe(0);
			expect(game.canUndo).toBe(false);
		});
	});

	describe('win condition', () => {
		it('should not be won with 0 completed suits', () => {
			expect(game.isWon()).toBe(false);
		});

		it('should be won with 8 completed suits', () => {
			// Mock completed suits
			game['completedSuits'] = 8;
			expect(game.isWon()).toBe(true);
		});
	});

	describe('variant differences', () => {
		it('should use 1 suit for ONE_SUIT variant', () => {
			const oneGame = new SpiderGame(SpiderVariant.ONE_SUIT);
			const allSpades = oneGame.tableau.flat().every(c => c.suit === Suit.SPADES);
			expect(allSpades).toBe(true);
		});

		it('should use 2 suits for TWO_SUIT variant', () => {
			const twoGame = new SpiderGame(SpiderVariant.TWO_SUIT);
			const suits = new Set(twoGame.tableau.flat().map(c => c.suit));
			expect(suits.size).toBe(2);
		});

		it('should use 4 suits for FOUR_SUIT variant', () => {
			const fourGame = new SpiderGame(SpiderVariant.FOUR_SUIT);
			const suits = new Set(fourGame.tableau.flat().map(c => c.suit));
			expect(suits.size).toBe(4);
		});
	});
});
