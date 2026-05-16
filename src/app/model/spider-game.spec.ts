import { SpiderGame, SpiderVariant } from './spider-game';
import { CardUtils, Suit, Rank } from './card';

describe('SpiderGame', () => {
	let game: SpiderGame;

	beforeEach(() => {
		game = new SpiderGame(SpiderVariant.FOUR_SUIT);
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

		it('should have 50 cards in stock after dealing', () => {
			expect(game.stock.length).toBe(50);
		});

		it('should have 0 completed suits initially', () => {
			expect(game.completed.length).toBe(0);
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});

		it('should have moveCount 0 initially', () => {
			expect(game.moveCount).toBe(0);
		});
	});

	describe('stock dealing', () => {
		it('should deal 10 cards from stock (one to each pile)', () => {
			const initialStockLength = game.stock.length;
			const result = game.dealFromStock();
			
			expect(result).toBe(true);
			expect(game.stock.length).toBe(initialStockLength - 10);
		});

		it('should not deal if any pile is empty', () => {
			game.tableau[0] = [];
			const result = game.dealFromStock();
			expect(result).toBe(false);
		});

		it('should increase move count after dealing', () => {
			game.dealFromStock();
			expect(game.moveCount).toBe(1);
		});
	});

	describe('undo functionality', () => {
		it('should allow undo after deal', () => {
			game.dealFromStock();
			expect(game.canUndo).toBe(true);
		});

		it('should restore stock after undoing deal', () => {
			const initialStockLength = game.stock.length;
			game.dealFromStock();
			game.undo();
			
			expect(game.stock.length).toBe(initialStockLength);
		});
	});

	describe('win condition', () => {
		it('should not be won with 0 completed suits', () => {
			expect(game.isWon()).toBe(false);
		});

		it('should be won with 8 completed suits', () => {
			// Simulate 8 completed suits
			for (let i = 0; i < 8; i++) {
				const sequence = [];
				for (let rank = Rank.KING; rank >= Rank.ACE; rank--) {
					sequence.push(CardUtils.createCard(Suit.SPADES, rank));
				}
				game.completed.push(sequence);
			}
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
