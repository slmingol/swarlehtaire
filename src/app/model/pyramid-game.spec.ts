import { PyramidGame } from './pyramid-game';
import { Card, CardUtils, Suit, Rank } from './card';

describe('PyramidGame', () => {
	let game: PyramidGame;

	beforeEach(() => {
		game = new PyramidGame();
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize pyramid with 28 cards', () => {
			const pyramidCards = game.pyramid.flat().filter(c => c !== null).length;
			expect(pyramidCards).toBe(28);
		});

		it('should initialize with 7 rows', () => {
			expect(game.pyramid.length).toBe(7);
		});

		it('should have 24 cards in stock', () => {
			expect(game.stock.length).toBe(24); // 52 - 28 = 24
		});

		it('should have no selected card initially', () => {
			expect(game.selected).toBeNull();
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});
	});

	describe('pair value calculation', () => {
		it('should calculate value for Ace as 1', () => {
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE);
			expect(game.getCardValue(ace)).toBe(1);
		});

		it('should calculate value for numbered cards', () => {
			const five = CardUtils.createCard(Suit.SPADES, Rank.FIVE);
			expect(game.getCardValue(five)).toBe(5);
		});

		it('should calculate value for Jack as 11', () => {
			const jack = CardUtils.createCard(Suit.SPADES, Rank.JACK);
			expect(game.getCardValue(jack)).toBe(11);
		});

		it('should calculate value for Queen as 12', () => {
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			expect(game.getCardValue(queen)).toBe(12);
		});

		it('should calculate value for King as 13', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			expect(game.getCardValue(king)).toBe(13);
		});
	});

	describe('card availability', () => {
		it('should have bottom row cards available initially', () => {
			const bottomRow = game.pyramid[6];
			bottomRow.forEach(card => {
				if (card) {
					expect(game.isCardAvailable(6, bottomRow.indexOf(card))).toBe(true);
				}
			});
		});

		it('should not have top card available if covered', () => {
			// Top card should be covered by cards below
			const isAvailable = game.isCardAvailable(0, 0);
			expect(isAvailable).toBe(false);
		});
	});

	describe('king removal', () => {
		it('should allow removing single King', () => {
			// Mock a King at an available position
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			game.pyramid[6][0] = king;
			
			const result = game.removePair(6, 0);
			expect(result).toBe(true);
			expect(game.pyramid[6][0]).toBeNull();
		});

		it('should not allow removing non-King as single card', () => {
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			game.pyramid[6][0] = queen;
			
			const result = game.removePair(6, 0);
			expect(result).toBe(false);
		});
	});

	describe('pair selection', () => {
		it('should select first card when none selected', () => {
			const card = game.pyramid[6][0];
			if (card) {
				game.selectCard(6, 0);
				expect(game.selected).not.toBeNull();
			}
		});

		it('should remove valid pair that sums to 13', () => {
			// Set up a valid pair
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE); // value 1
			const queen = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN); // value 12
			
			game.pyramid[6][0] = ace;
			game.pyramid[6][1] = queen;
			
			game.selectCard(6, 0); // Select Ace
			game.selectCard(6, 1); // Select Queen - should remove both
			
			expect(game.pyramid[6][0]).toBeNull();
			expect(game.pyramid[6][1]).toBeNull();
		});

		it('should not remove pair that does not sum to 13', () => {
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE); // value 1
			const jack = CardUtils.createCard(Suit.HEARTS, Rank.JACK); // value 11
			
			game.pyramid[6][0] = ace;
			game.pyramid[6][1] = jack;
			
			game.selectCard(6, 0);
			const result = game.selectCard(6, 1);
			
			expect(result).toBe(false);
		});
	});

	describe('stock operations', () => {
		it('should draw card from stock', () => {
			const initialStockLength = game.stock.length;
			const result = game.drawFromStock();
			
			expect(result).toBe(true);
			expect(game.stock.length).toBe(initialStockLength - 1);
			expect(game.waste).not.toBeNull();
		});

		it('should not draw when stock is empty', () => {
			game.stock = [];
			const result = game.drawFromStock();
			
			expect(result).toBe(false);
		});

		it('should allow pairing waste with pyramid', () => {
			// Set up waste and pyramid cards that sum to 13
			const six = CardUtils.createCard(Suit.SPADES, Rank.SIX);
			const seven = CardUtils.createCard(Suit.HEARTS, Rank.SEVEN);
			
			game.pyramid[6][0] = six;
			game.waste = seven;
			
			game.selectWaste();
			game.selectCard(6, 0);
			
			expect(game.pyramid[6][0]).toBeNull();
			expect(game.waste).toBeNull();
		});
	});

	describe('undo functionality', () => {
		it('should allow undo after removing pair', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			game.pyramid[6][0] = king;
			
			game.removePair(6, 0);
			expect(game.canUndo).toBe(true);
		});

		it('should restore removed pair', () => {
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE);
			const queen = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN);
			
			game.pyramid[6][0] = ace;
			game.pyramid[6][1] = queen;
			
			game.selectCard(6, 0);
			game.selectCard(6, 1);
			
			game.undo();
			
			expect(game.pyramid[6][0]).not.toBeNull();
			expect(game.pyramid[6][1]).not.toBeNull();
		});

		it('should undo stock draw', () => {
			const initialStockLength = game.stock.length;
			game.drawFromStock();
			game.undo();
			
			expect(game.stock.length).toBe(initialStockLength);
		});
	});

	describe('win condition', () => {
		it('should not be won with cards in pyramid', () => {
			expect(game.isWon()).toBe(false);
		});

		it('should be won when pyramid is cleared', () => {
			// Clear all pyramid cards
			for (let row = 0; row < 7; row++) {
				for (let col = 0; col < game.pyramid[row].length; col++) {
					game.pyramid[row][col] = null;
				}
			}
			
			expect(game.isWon()).toBe(true);
		});
	});
});
