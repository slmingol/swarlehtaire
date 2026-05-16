import { FreeCellGame } from './freecell-game';
import { Card, CardUtils, Suit, Rank } from './card';

describe('FreeCellGame', () => {
	let game: FreeCellGame;

	beforeEach(() => {
		game = new FreeCellGame();
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize with 8 cascades', () => {
			expect(game.cascades.length).toBe(8);
		});

		it('should initialize with 4 free cells', () => {
			expect(game.cells.length).toBe(4);
		});

		it('should initialize with 4 foundations', () => {
			expect(game.foundations.length).toBe(4);
		});

		it('should have all 52 cards dealt to cascades', () => {
			const totalCards = game.cascades.reduce((sum, cascade) => sum + cascade.length, 0);
			expect(totalCards).toBe(52);
		});

		it('should have first 4 cascades with 7 cards', () => {
			for (let i = 0; i < 4; i++) {
				expect(game.cascades[i].length).toBe(7);
			}
		});

		it('should have last 4 cascades with 6 cards', () => {
			for (let i = 4; i < 8; i++) {
				expect(game.cascades[i].length).toBe(6);
			}
		});

		it('should have all cells empty', () => {
			game.cells.forEach(cell => expect(cell).toBeNull());
		});

		it('should have all foundations empty', () => {
			game.foundations.forEach(foundation => expect(foundation.length).toBe(0));
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});
	});

	describe('supermove calculation', () => {
		it('should calculate max move with no empty cells or cascades', () => {
			// Fill all cells
			game.cells = [
				CardUtils.createCard(Suit.SPADES, Rank.ACE),
				CardUtils.createCard(Suit.HEARTS, Rank.ACE),
				CardUtils.createCard(Suit.DIAMONDS, Rank.ACE),
				CardUtils.createCard(Suit.CLUBS, Rank.ACE)
			];
			// Formula: 2^0 * (0+1) = 1
			expect(game.getMaxMoveSize(false)).toBe(1);
		});

		it('should calculate max move with 2 empty cells', () => {
			game.cells = [null, null, CardUtils.createCard(Suit.SPADES, Rank.ACE), CardUtils.createCard(Suit.HEARTS, Rank.ACE)];
			// Formula: 2^0 * (2+1) = 3
			expect(game.getMaxMoveSize(false)).toBe(3);
		});

		it('should calculate max move with 1 empty cascade', () => {
			game.cells = [null, null, null, null];
			// Formula: 2^1 * (4+1) = 10
			expect(game.getMaxMoveSize(true)).toBe(10);
		});

		it('should calculate max move with 2 empty cascades and 3 empty cells', () => {
			game.cells = [null, null, null, CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.cascades[0] = [];
			game.cascades[1] = [];
			const emptyCascades = game.cascades.filter(c => c.length === 0).length;
			// Formula: 2^2 * (3+1) = 16
			expect(game.getMaxMoveSize(true)).toBe(16);
		});
	});

	describe('cascade move validation', () => {
		it('should allow moving to empty cascade', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.cascades[0][0].faceUp = true;
			game.cascades[1] = [];

			const result = game.moveCascade(0, 0, 1);
			expect(result).toBe(true);
			expect(game.cascades[1].length).toBe(1);
		});

		it('should allow valid descending alternate color move', () => {
			game.cascades[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.HEARTS, Rank.FIVE)
			];
			game.cascades[0].forEach(c => c.faceUp = true);
			
			game.cascades[1] = [CardUtils.createCard(Suit.DIAMONDS, Rank.SIX)];
			game.cascades[1][0].faceUp = true;

			const result = game.moveCascade(0, 1, 1);
			expect(result).toBe(true);
		});

		it('should reject same color move', () => {
			game.cascades[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.CLUBS, Rank.FIVE)
			];
			game.cascades[0].forEach(c => c.faceUp = true);
			
			game.cascades[1] = [CardUtils.createCard(Suit.SPADES, Rank.SIX)];
			game.cascades[1][0].faceUp = true;

			const result = game.moveCascade(0, 1, 1);
			expect(result).toBe(false);
		});

		it('should reject ascending rank move', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.HEARTS, Rank.SIX)];
			game.cascades[0][0].faceUp = true;
			
			game.cascades[1] = [CardUtils.createCard(Suit.SPADES, Rank.FIVE)];
			game.cascades[1][0].faceUp = true;

			const result = game.moveCascade(0, 0, 1);
			expect(result).toBe(false);
		});

		it('should enforce supermove limit', () => {
			// Fill all cells to limit moves
			game.cells = [
				CardUtils.createCard(Suit.SPADES, Rank.ACE),
				CardUtils.createCard(Suit.HEARTS, Rank.ACE),
				CardUtils.createCard(Suit.DIAMONDS, Rank.ACE),
				CardUtils.createCard(Suit.CLUBS, Rank.ACE)
			];

			// Try to move more than 1 card (max allowed with no free cells/cascades)
			game.cascades[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.FIVE),
				CardUtils.createCard(Suit.HEARTS, Rank.FOUR),
				CardUtils.createCard(Suit.CLUBS, Rank.THREE)
			];
			game.cascades[0].forEach(c => c.faceUp = true);
			
			game.cascades[1] = [CardUtils.createCard(Suit.DIAMONDS, Rank.SIX)];
			game.cascades[1][0].faceUp = true;

			const result = game.moveCascade(0, 1, 1);
			expect(result).toBe(false); // Should fail due to supermove limit
		});
	});

	describe('cell operations', () => {
		it('should allow moving card to empty cell', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.cascades[0][0].faceUp = true;
			game.cells = [null, null, null, null];

			const result = game.moveToCell(0, 0);
			expect(result).toBe(true);
			expect(game.cells[0]).not.toBeNull();
		});

		it('should reject moving multiple cards to cell', () => {
			game.cascades[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.HEARTS, Rank.QUEEN)
			];
			game.cascades[0].forEach(c => c.faceUp = true);

			const result = game.moveToCell(0, 0);
			expect(result).toBe(false);
		});

		it('should reject moving to occupied cell', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.cascades[0][0].faceUp = true;
			game.cells = [CardUtils.createCard(Suit.HEARTS, Rank.ACE), null, null, null];

			const result = game.moveToCell(0, 0);
			expect(result).toBe(false);
		});
	});

	describe('foundation operations', () => {
		it('should allow Ace to empty foundation', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.cascades[0][0].faceUp = true;

			const result = game.moveToFoundation(0);
			expect(result).toBe(true);
			expect(game.foundations[0].length).toBe(1);
		});

		it('should allow sequential same-suit card to foundation', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.TWO)];
			game.cascades[0][0].faceUp = true;

			const result = game.moveToFoundation(0);
			expect(result).toBe(true);
			expect(game.foundations[0].length).toBe(2);
		});

		it('should reject non-Ace to empty foundation', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.cascades[0][0].faceUp = true;

			const result = game.moveToFoundation(0);
			expect(result).toBe(false);
		});
	});

	describe('undo functionality', () => {
		it('should undo cascade move', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.FIVE)];
			game.cascades[0][0].faceUp = true;
			game.cascades[1] = [CardUtils.createCard(Suit.HEARTS, Rank.SIX)];
			game.cascades[1][0].faceUp = true;

			game.moveCascade(0, 0, 1);
			expect(game.canUndo).toBe(true);
			
			game.undo();
			expect(game.cascades[0].length).toBe(1);
			expect(game.cascades[1].length).toBe(1);
		});

		it('should undo cell move', () => {
			game.cascades[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.cascades[0][0].faceUp = true;
			game.cells = [null, null, null, null];

			game.moveToCell(0, 0);
			game.undo();

			expect(game.cascades[0].length).toBe(1);
			expect(game.cells[0]).toBeNull();
		});
	});

	describe('win condition', () => {
		it('should not be won initially', () => {
			expect(game.isWon()).toBe(false);
		});

		it('should be won when all foundations complete', () => {
			// Fill all foundations with K-A sequences
			for (let suit = 0; suit < 4; suit++) {
				game.foundations[suit] = [];
				for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
					game.foundations[suit].push(CardUtils.createCard(suit, rank));
				}
			}

			expect(game.isWon()).toBe(true);
		});
	});
});
