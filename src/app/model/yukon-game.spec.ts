import { YukonGame } from './yukon-game';
import { CardUtils, Suit, Rank } from './card';

describe('YukonGame', () => {
	let game: YukonGame;

	beforeEach(() => {
		game = new YukonGame();
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize with 7 tableau columns', () => {
			expect(game.tableau.length).toBe(7);
		});

		it('should initialize with 4 foundations', () => {
			expect(game.foundations.length).toBe(4);
		});

		it('should have all 52 cards in tableau', () => {
			const totalCards = game.tableau.reduce((sum, col) => sum + col.length, 0);
			expect(totalCards).toBe(52);
		});

		it('should have first column with 1 card face-up', () => {
			expect(game.tableau[0].length).toBeGreaterThan(0);
			expect(game.tableau[0][0].faceUp).toBe(true);
		});

		it('should have face-down cards in columns 2-7', () => {
			for (let col = 1; col < 7; col++) {
				const hasFaceDown = game.tableau[col].some(c => !c.faceUp);
				expect(hasFaceDown).toBe(true);
			}
		});

		it('should have all foundations empty', () => {
			game.foundations.forEach(foundation => {
				expect(foundation.length).toBe(0);
			});
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});
	});

	describe('card placement', () => {
		it('should allow alternate color descending placement', () => {
			const redKing = CardUtils.createCard(Suit.HEARTS, Rank.KING);
			const blackQueen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			
			expect(game.canPlaceOnTableau(blackQueen, redKing)).toBe(true);
		});

		it('should reject same color placement', () => {
			const blackKing = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const blackQueen = CardUtils.createCard(Suit.CLUBS, Rank.QUEEN);
			
			expect(game.canPlaceOnTableau(blackQueen, blackKing)).toBe(false);
		});

		it('should reject ascending rank', () => {
			const queen = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN);
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			
			expect(game.canPlaceOnTableau(king, queen)).toBe(false);
		});

		it('should allow King on empty column', () => {
			game.tableau[0] = [];
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.tableau[1][0].faceUp = true;
			
			const result = game.moveCards(1, 0, 0);
			expect(result).toBe(true);
		});
	});

	describe('card movement', () => {
		it('should allow moving any face-up card regardless of sequence', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.HEARTS, Rank.FIVE),
				CardUtils.createCard(Suit.CLUBS, Rank.TEN)
			];
			game.tableau[0].forEach(c => c.faceUp = true);
			
			game.tableau[1] = [CardUtils.createCard(Suit.DIAMONDS, Rank.SIX)];
			game.tableau[1][0].faceUp = true;
			
			// Move the 5 (middle card) with 10 below it
			const result = game.moveCards(0, 1, 1);
			expect(result).toBe(true);
			expect(game.tableau[1].length).toBe(3); // 6, 5, 10
		});

		it('should not allow moving face-down card', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.tableau[0][0].faceUp = false;
			
			game.tableau[1] = [];
			
			const result = game.moveCards(0, 0, 1);
			expect(result).toBe(false);
		});

		it('should flip card when uncovered', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.HEARTS, Rank.QUEEN)
			];
			game.tableau[0][0].faceUp = false;
			game.tableau[0][1].faceUp = true;
			
			game.tableau[1] = [];
			
			game.moveCards(0, 1, 1);
			
			expect(game.tableau[0][0].faceUp).toBe(true);
		});
	});

	describe('foundation operations', () => {
		it('should allow Ace to empty foundation', () => {
			const ace = CardUtils.createCard(Suit.SPADES, Rank.ACE);
			ace.faceUp = true;
			game.tableau[0] = [ace];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(true);
			expect(game.foundations[0].length).toBe(1);
		});

		it('should allow sequential same-suit card', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			const two = CardUtils.createCard(Suit.SPADES, Rank.TWO);
			two.faceUp = true;
			game.tableau[0] = [two];
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(true);
			expect(game.foundations[0].length).toBe(2);
		});

		it('should reject non-sequential card', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.THREE)];
			game.tableau[0][0].faceUp = true;
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(false);
		});

		it('should reject different suit', () => {
			game.foundations[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[0] = [CardUtils.createCard(Suit.HEARTS, Rank.TWO)];
			game.tableau[0][0].faceUp = true;
			
			const result = game.moveToFoundation(0);
			expect(result).toBe(false);
		});
	});

	describe('undo functionality', () => {
		it('should undo tableau move', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.HEARTS, Rank.FIVE)];
			game.tableau[0][0].faceUp = true;
			
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.SIX)];
			game.tableau[1][0].faceUp = true;
			
			game.moveCards(0, 0, 1);
			game.undo();
			
			expect(game.tableau[0].length).toBe(1);
			expect(game.tableau[1].length).toBe(1);
		});

		it('should undo foundation move', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[0][0].faceUp = true;
			
			game.moveToFoundation(0);
			game.undo();
			
			expect(game.tableau[0].length).toBe(1);
			expect(game.foundations[0].length).toBe(0);
		});

		it('should restore face-down state', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.HEARTS, Rank.QUEEN)
			];
			game.tableau[0][0].faceUp = false;
			game.tableau[0][1].faceUp = true;
			
			game.tableau[1] = [];
			
			game.moveCards(0, 1, 1);
			game.undo();
			
			expect(game.tableau[0][0].faceUp).toBe(false);
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
	});

	describe('undo functionality', () => {
		it('should allow undo after move', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.HEARTS, Rank.QUEEN)];
			game.tableau[0][0].faceUp = true;
			
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.tableau[1][0].faceUp = true;
			
			game.moveCards(0, 0, 1);
			expect(game.canUndo).toBe(true);
			
			game.undo();
			expect(game.tableau[0].length).toBe(1);
		});
	});
});
