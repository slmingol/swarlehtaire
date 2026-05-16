import { KlondikeGame, GameVariant } from './klondike-game';
import { CardUtils, Suit, Rank } from './card';

describe('KlondikeGame', () => {
	let game: KlondikeGame;

	beforeEach(() => {
		game = new KlondikeGame(GameVariant.KLONDIKE_DRAW_3);
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize with 7 tableau piles', () => {
			expect(game.tableau.length).toBe(7);
		});

		it('should initialize with 4 foundations', () => {
			expect(game.foundations.length).toBe(4);
		});

		it('should have correct tableau layout', () => {
			for (let i = 0; i < 7; i++) {
				expect(game.tableau[i].cards.length).toBe(i + 1);
			}
		});

		it('should have stock pile with remaining cards', () => {
			const tableauCards = game.tableau.reduce((sum, pile) => sum + pile.cards.length, 0);
			expect(game.stock.cards.length).toBe(52 - tableauCards);
		});

		it('should have empty waste pile', () => {
			expect(game.waste.cards.length).toBe(0);
		});

		it('should have all foundations empty', () => {
			game.foundations.forEach(foundation => {
				expect(foundation.cards.length).toBe(0);
			});
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});
	});

	describe('variant configurations', () => {
		it('should use draw 3 for KLONDIKE_DRAW_3', () => {
			const draw3Game = new KlondikeGame(GameVariant.KLONDIKE_DRAW_3);
			expect(draw3Game.config.drawCount).toBe(3);
			expect(draw3Game.config.tableauCount).toBe(7);
		});

		it('should use draw 1 for KLONDIKE_DRAW_1', () => {
			const draw1Game = new KlondikeGame(GameVariant.KLONDIKE_DRAW_1);
			expect(draw1Game.config.drawCount).toBe(1);
		});

		it('should have all face-up for WESTCLIFF', () => {
			const westcliffGame = new KlondikeGame(GameVariant.WESTCLIFF);
			expect(westcliffGame.config.allFaceUp).toBe(true);
		});

		it('should have 10 tableau for EASTHAVEN', () => {
			const easthavenGame = new KlondikeGame(GameVariant.EASTHAVEN);
			expect(easthavenGame.config.tableauCount).toBe(10);
		});
	});

	describe('stock operations', () => {
		it('should draw cards from stock', () => {
			const initialStockCount = game.stock.cards.length;
			game.drawFromStock();
			
			expect(game.waste.cards.length).toBeGreaterThan(0);
			expect(game.stock.cards.length).toBeLessThan(initialStockCount);
		});

		it('should recycle waste when stock is empty', () => {
			// Empty the stock
			while (game.stock.cards.length > 0) {
				game.drawFromStock();
			}
			
			const wasteCount = game.waste.cards.length;
			game.drawFromStock(); // Should recycle
			
			expect(game.stock.cards.length).toBe(wasteCount);
			expect(game.waste.cards.length).toBe(0);
		});

		it('should respect draw count', () => {
			const draw1Game = new KlondikeGame(GameVariant.KLONDIKE_DRAW_1);
			draw1Game.drawFromStock();
			
			expect(draw1Game.waste.cards.length).toBe(1);
		});
	});

	describe('tableau movement', () => {
		it('should allow alternate color descending', () => {
			const redKing = CardUtils.createCard(Suit.HEARTS, Rank.KING);
			redKing.faceUp = true;
			game.tableau[0].cards = [redKing];
			
			const blackQueen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			blackQueen.faceUp = true;
			game.tableau[1].cards = [blackQueen];
			
			const result = game.moveTableauCard(1, 0);
			expect(result).toBe(true);
		});

		it('should reject same color', () => {
			const blackKing = CardUtils.createCard(Suit.SPADES, Rank.KING);
			blackKing.faceUp = true;
			game.tableau[0].cards = [blackKing];
			
			const blackQueen = CardUtils.createCard(Suit.CLUBS, Rank.QUEEN);
			blackQueen.faceUp = true;
			game.tableau[1].cards = [blackQueen];
			
			const result = game.moveTableauCard(1, 0);
			expect(result).toBe(false);
		});

		it('should allow King to empty pile', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			king.faceUp = true;
			game.tableau[0].cards = [king];
			game.tableau[1].cards = [];
			
			const result = game.moveTableauCard(0, 1);
			expect(result).toBe(true);
		});

		it('should flip uncovered card', () => {
			const faceDownCard = CardUtils.createCard(Suit.SPADES, Rank.KING);
			faceDownCard.faceUp = false;
			const faceUpCard = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN);
			faceUpCard.faceUp = true;
			
			game.tableau[0].cards = [faceDownCard, faceUpCard];
			game.tableau[1].cards = [];
			
			game.moveTableauCard(0, 1);
			
			expect(game.tableau[0].cards[0].faceUp).toBe(true);
		});
	});

	describe('foundation operations', () => {
		it('should allow Ace to empty foundation', () => {
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE);
			ace.faceUp = true;
			game.tableau[0].cards = [ace];
			
			const result = game.moveToFoundation(game.tableau[0]);
			expect(result).toBe(true);
		});

		it('should allow sequential same-suit build', () => {
			game.foundations[0].cards = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			
			const two = CardUtils.createCard(Suit.SPADES, Rank.TWO);
			two.faceUp = true;
			game.tableau[0].cards = [two];
			
			const result = game.moveToFoundation(game.tableau[0]);
			expect(result).toBe(true);
		});

		it('should reject non-Ace to empty foundation', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			king.faceUp = true;
			game.tableau[0].cards = [king];
			
			const result = game.moveToFoundation(game.tableau[0]);
			expect(result).toBe(false);
		});

		it('should reject different suit', () => {
			game.foundations[0].cards = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			
			const two = CardUtils.createCard(Suit.HEARTS, Rank.TWO);
			two.faceUp = true;
			game.tableau[0].cards = [two];
			
			const result = game.moveToFoundation(game.tableau[0]);
			expect(result).toBe(false);
		});
	});

	describe('auto-complete', () => {
		it('should move eligible cards to foundations', () => {
			// Set up low-value cards that can auto-move
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE);
			ace.faceUp = true;
			game.tableau[0].cards = [ace];
			
			const moved = game.autoComplete();
			expect(moved).toBeGreaterThan(0);
		});

		it('should not move cards that are too high', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			king.faceUp = true;
			game.tableau[0].cards = [king];
			
			const moved = game.autoComplete();
			expect(moved).toBe(0);
		});
	});

	describe('undo functionality', () => {
		it('should undo stock draw', () => {
			const initialStockCount = game.stock.cards.length;
			game.drawFromStock();
			game.undo();
			
			expect(game.stock.cards.length).toBe(initialStockCount);
		});

		it('should undo tableau move', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			king.faceUp = true;
			game.tableau[0].cards = [king];
			game.tableau[1].cards = [];
			
			game.moveTableauCard(0, 1);
			game.undo();
			
			expect(game.tableau[0].cards.length).toBe(1);
			expect(game.tableau[1].cards.length).toBe(0);
		});

		it('should undo foundation move', () => {
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE);
			ace.faceUp = true;
			game.tableau[0].cards = [ace];
			
			game.moveToFoundation(game.tableau[0]);
			game.undo();
			
			expect(game.tableau[0].cards.length).toBe(1);
			expect(game.foundations[0].cards.length).toBe(0);
		});

		it('should restore face-down state', () => {
			const faceDown = CardUtils.createCard(Suit.SPADES, Rank.KING);
			faceDown.faceUp = false;
			const faceUp = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN);
			faceUp.faceUp = true;
			
			game.tableau[0].cards = [faceDown, faceUp];
			game.tableau[1].cards = [];
			
			game.moveTableauCard(0, 1);
			game.undo();
			
			expect(game.tableau[0].cards[0].faceUp).toBe(false);
		});
	});

	describe('win condition', () => {
		it('should not be won initially', () => {
			expect(game.isWon()).toBe(false);
		});

		it('should be won when all foundations complete', () => {
			// Fill all foundations
			for (let suit = 0; suit < 4; suit++) {
				game.foundations[suit].cards = [];
				for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
					game.foundations[suit].cards.push(CardUtils.createCard(suit, rank));
				}
			}
			
			expect(game.isWon()).toBe(true);
		});
	});
});
