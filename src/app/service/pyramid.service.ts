import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PyramidGame } from '../model/pyramid-game';
import { Card } from '../model/card';

export interface PyramidGameState {
	pyramid: Card[][];
	stock: Card[];
	waste: Card | null;
	stockIndex: number;
	remainingCount: number;
	isWon: boolean;
	isGameOver: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class PyramidService {
	private game: PyramidGame = new PyramidGame();
	private gameState$ = new BehaviorSubject<PyramidGameState>(this.getState());

	getGameState(): Observable<PyramidGameState> {
		return this.gameState$.asObservable();
	}

	newGame(): void {
		this.game = new PyramidGame();
		this.updateState();
	}

	removeKing(row: number, col: number): boolean {
		const success = this.game.removeKing(row, col);
		if (success) this.updateState();
		return success;
	}

	removePyramidPair(row1: number, col1: number, row2: number, col2: number): boolean {
		const success = this.game.removePyramidPair(row1, col1, row2, col2);
		if (success) this.updateState();
		return success;
	}

	removeWastePyramidPair(row: number, col: number): boolean {
		const success = this.game.removeWastePyramidPair(row, col);
		if (success) this.updateState();
		return success;
	}

	drawFromStock(): boolean {
		const success = this.game.drawFromStock();
		if (success) this.updateState();
		return success;
	}

	private getState(): PyramidGameState {
		return {
			pyramid: this.game.pyramid,
			stock: this.game.stock,
			waste: this.game.waste,
			stockIndex: this.game.stockIndex,
			remainingCount: this.game.getRemainingPyramidCount(),
			isWon: this.game.isWon(),
			isGameOver: this.game.isGameOver()
		};
	}

	private updateState(): void {
		this.gameState$.next(this.getState());
	}
}
