import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { KlondikeGame, GameVariant } from '../model/klondike-game';
import { Card } from '../model/card';
import { CardStack } from '../model/card-stack';

export interface GameState {
	stock: Card[];
	waste: Card[];
	foundations: Card[][];
	tableau: Card[][];
	moveCount: number;
	canUndo: boolean;
	isWon: boolean;
	variant: GameVariant;
}

@Injectable({
	providedIn: 'root'
})
export class KlondikeService {
	private game: KlondikeGame;
	private gameState$ = new BehaviorSubject<GameState>(this.getInitialState());

	constructor() {
		this.game = new KlondikeGame();
		this.game.newGame();
		this.updateState();
	}

	get state$(): Observable<GameState> {
		return this.gameState$.asObservable();
	}

	get currentState(): GameState {
		return this.gameState$.value;
	}

	private getInitialState(): GameState {
		const tableauCount = this.game?.config?.tableauCount || 7;
		return {
			stock: [],
			waste: [],
			foundations: [[], [], [], []],
			tableau: Array.from({ length: tableauCount }, () => []),
			moveCount: 0,
			canUndo: false,
			isWon: false,
			variant: GameVariant.KLONDIKE_DRAW_3
		};
	}

	private updateState(): void {
		const state: GameState = {
			stock: this.game.stock.cards,
			waste: this.game.waste.cards,
			foundations: this.game.foundations.map(f => f.cards),
			tableau: this.game.tableau.map(t => t.cards),
			moveCount: this.game.moveCount,
			canUndo: this.game.canUndo,
			isWon: this.game.isWon(),
			variant: this.game.config.variant
		};
		this.gameState$.next(state);
	}

	changeVariant(variant: GameVariant): void {
		this.game = new KlondikeGame(variant);
		this.updateState();
	}

	newGame(): void {
		this.game.newGame();
		this.updateState();
	}

	drawFromStock(): void {
		this.game.drawFromStock();
		this.updateState();
	}

	moveCard(fromStack: CardStack, toStack: CardStack, cardIndex: number): boolean {
		const success = this.game.moveCards(fromStack, toStack, cardIndex);
		if (success) {
			this.updateState();
		}
		return success;
	}

	undo(): void {
		this.game.undo();
		this.updateState();
	}

	autoMoveToFoundations(): number {
		const moved = this.game.autoMoveToFoundations();
		if (moved > 0) {
			this.updateState();
		}
		return moved;
	}

	// Helper methods to get stacks by index
	getTableauStack(index: number): CardStack {
		return this.game.tableau[index];
	}

	getFoundationStack(index: number): CardStack {
		return this.game.foundations[index];
	}

	getStockStack(): CardStack {
		return this.game.stock;
	}

	getWasteStack(): CardStack {
		return this.game.waste;
	}
}
