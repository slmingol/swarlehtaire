import { ScorpionGame } from './scorpion-game';
import { CardUtils, Suit, Rank } from './card';

describe('ScorpionGame', () => {
	let game: ScorpionGame;

	beforeEach(() => {
		game = new ScorpionGame();
	});

	describe('initialization', () => {
		it('should create an instance', () => {
			expect(game).toBeTruthy();
		});

		it('should initialize with 7 tableau columns', () => {
			expect(game.tableau.length).toBe(7);
		});

		it('should have 7 cards in each column', () => {
			game.tableau.forEach(column => {
				expect(column.length).toBe(7);
			});
		});

		it('should have 3 cards in reserve', () => {
			expect(game.reserve.length).toBe(3);
		});

		it('should have face-down cards in first 4 columns', () => {
			for (let col = 0; col < 4; col++) {
				const faceDownCount = game.tableau[col].filter(c => !c.faceUp).length;
				expect(faceDownCount).toBe(3);
			});
		});

		it('should have all face-up cards in last 3 columns', () => {
			for (let col = 4; col < 7; col++) {
				const allFaceUp = game.tableau[col].every(c => c.faceUp);
				expect(allFaceUp).toBe(true);
			}
		});

		it('should not have dealt reserve initially', () => {
			expect(game.reserveDealt).toBe(false);
		});

		it('should have canUndo false initially', () => {
			expect(game.canUndo).toBe(false);
		});
	});

	describe('card placement', () => {
		it.skip('should allow same-suit descending placement', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			
			expect(game.canPlaceOn(queen, king)).toBe(true);
		});

		it.skip('should reject different suit', () => {
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			const queen = CardUtils.createCard(Suit.HEARTS, Rank.QUEEN);
			
			expect(game.canPlaceOn(queen, king)).toBe(false);
		});

		it.skip('should reject ascending rank', () => {
			const queen = CardUtils.createCard(Suit.SPADES, Rank.QUEEN);
			const king = CardUtils.createCard(Suit.SPADES, Rank.KING);
			
			expect(game.canPlaceOn(king, queen)).toBe(false);
		});

		it.skip('should only allow King on empty column', () => {
			game.tableau[0] = [];
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.tableau[1][0].faceUp = true;
			
			const result = game.moveCards(1, 0, 0);
			expect(result).toBe(true);
		});

		it.skip('should reject non-King on empty column', () => {
			game.tableau[0] = [];
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.QUEEN)];
			game.tableau[1][0].faceUp = true;
			
			const result = game.moveCards(1, 0, 0);
			expect(result).toBe(false);
		});
	});

	describe('card movement', () => {
		it.skip('should allow moving face-up card with all cards below', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN),
				CardUtils.createCard(Suit.SPADES, Rank.JACK)
			];
			game.tableau[0].forEach(c => c.faceUp = true);
			
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.ACE)];
			game.tableau[1][0].faceUp = true;
			
			const result = game.moveCards(0, 1, 1);
			expect(result).toBe(true);
			expect(game.tableau[1].length).toBe(3); // Original + 2 moved
		});

		it.skip('should not allow moving face-down card', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.tableau[0][0].faceUp = false;
			
			game.tableau[1] = [];
			
			const result = game.moveCards(0, 0, 1);
			expect(result).toBe(false);
		});

		it.skip('should flip card when uncovered', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN)
			];
			game.tableau[0][0].faceUp = false;
			game.tableau[0][1].faceUp = true;
			
			game.tableau[1] = [];
			
			game.moveCards(0, 1, 1);
			
			expect(game.tableau[0][0].faceUp).toBe(true);
		});
	});

	describe('reserve dealing', () => {
		it.skip('should deal 3 cards to first 3 columns', () => {
			const initialLengths = game.tableau.slice(0, 3).map(col => col.length);
			
			const result = game.dealReserve();
			expect(result).toBe(true);
			
			for (let i = 0; i < 3; i++) {
				expect(game.tableau[i].length).toBe(initialLengths[i] + 1);
			}
		});

		it.skip('should mark reserve as dealt', () => {
			game.dealReserve();
			expect(game.reserveDealt).toBe(true);
		});

		it.skip('should not allow dealing reserve twice', () => {
			game.dealReserve();
			const result = game.dealReserve();
			expect(result).toBe(false);
		});

		it.skip('should allow undoing reserve deal', () => {
			game.dealReserve();
			game.undo();
			
			expect(game.reserveDealt).toBe(false);
			expect(game.reserve.length).toBe(3);
		});
	});

	describe('undo functionality', () => {
		it.skip('should undo card move', () => {
			game.tableau[0] = [CardUtils.createCard(Suit.SPADES, Rank.QUEEN)];
			game.tableau[0][0].faceUp = true;
			
			game.tableau[1] = [CardUtils.createCard(Suit.SPADES, Rank.KING)];
			game.tableau[1][0].faceUp = true;
			
			game.moveCards(0, 0, 1);
			const col1Length = game.tableau[1].length;
			
			game.undo();
			
			expect(game.tableau[0].length).toBe(1);
			expect(game.tableau[1].length).toBe(col1Length - 1);
		});

		it.skip('should restore face-down state after undo', () => {
			game.tableau[0] = [
				CardUtils.createCard(Suit.SPADES, Rank.KING),
				CardUtils.createCard(Suit.SPADES, Rank.QUEEN)
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
		it.skip('should not be won initially', () => {
			expect(game.isWon()).toBe(false);
		});

		it.skip('should be won with 4 complete K-A sequences', () => {
			// Create 4 complete K-A same-suit sequences
			for (let col = 0; col < 4; col++) {
				game.tableau[col] = [];
				for (let rank = Rank.KING; rank >= Rank.ACE; rank--) {
					const card = CardUtils.createCard(col, rank);
					card.faceUp = true;
					game.tableau[col].push(card);
				}
			}
			
			// Clear remaining columns
			for (let col = 4; col < 7; col++) {
				game.tableau[col] = [];
			}
			
			expect(game.isWon()).toBe(true);
		});

		it.skip('should not be won with incomplete sequences', () => {
			// Create sequences missing some cards
			for (let col = 0; col < 4; col++) {
				game.tableau[col] = [];
				for (let rank = Rank.KING; rank >= Rank.TWO; rank--) {
					const card = CardUtils.createCard(col, rank);
					card.faceUp = true;
					game.tableau[col].push(card);
				}
			}
			
			expect(game.isWon()).toBe(false);
		});
	});
});
