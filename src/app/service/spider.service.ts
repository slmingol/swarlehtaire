import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SpiderGame, SpiderVariant } from '../model/spider-game';
import { Card } from '../model/card';

export interface SpiderGameState {
	tableau: Card[][];
	stock: Card[];
	stockCount: number;
	completedCount: number;
	isWon: boolean;
	variant: SpiderVariant;
}

@Injectable({
	providedIn: 'root'
})
export class SpiderService {
	private game!: SpiderGame;
	private gameState$ = new BehaviorSubject<SpiderGameState>(this.getInitialState());

	constructor() {
		this.newGame();
	}

	get state$(): Observable<SpiderGameState> {
		return this.gameState$.asObservable();
	}

	private getInitialState(): SpiderGameState {
		return {
			tableau: Array.from({ length: 10 }, () => []),
			stock: [],
			stockCount: 0,
			completedCount: 0,
			isWon: false,
			variant: SpiderVariant.FOUR_SUIT
		};
	}

	newGame(variant?: SpiderVariant): void {
		if (variant) {
			this.game = new SpiderGame(variant);
		} else if (!this.game) {
			this.game = new SpiderGame();
		} else {
			this.game.newGame();
		}
		this.updateState();
	}

	changeVariant(variant: SpiderVariant): void {
		this.game = new SpiderGame(variant);
		this.updateState();
	}

	moveCards(fromPile: number, fromIndex: number, toPile: number): boolean {
		const success = this.game.moveCards(fromPile, fromIndex, toPile);
		if (success) {
			this.updateState();
		}
		return success;
	}

	dealFromStock(): boolean {
		const success = this.game.dealFromStock();
		if (success) {
			this.updateState();
		}
		return success;
	}

	getTableauPile(index: number): Card[] {
		return this.game.tableau[index] || [];
	}

	private updateState(): void {
		const state: SpiderGameState = {
			tableau: this.game.tableau.map(pile => [...pile]),
			stock: [...this.game.stock],
			stockCount: this.game.stockCount,
			completedCount: this.game.completedCount,
			isWon: this.game.isWon(),
			variant: this.game['variant'] // Access private field for state
		};
		this.gameState$.next(state);
	}
}
