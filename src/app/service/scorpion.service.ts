import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScorpionGame } from '../model/scorpion-game';
import { Card } from '../model/card';

export interface ScorpionGameState {
	tableau: Card[][];
	reserve: Card[];
	reserveDealt: boolean;
	isWon: boolean;
	canUndo: boolean;
	moveCount: number;
}

@Injectable({
	providedIn: 'root'
})
export class ScorpionService {
	private game: ScorpionGame = new ScorpionGame();
	private gameState$ = new BehaviorSubject<ScorpionGameState>(this.getState());

	getGameState(): Observable<ScorpionGameState> {
		return this.gameState$.asObservable();
	}

	newGame(): void {
		this.game = new ScorpionGame();
		this.updateState();
	}

	moveCards(fromCol: number, cardIndex: number, toCol: number): boolean {
		const success = this.game.moveCards(fromCol, cardIndex, toCol);
		if (success) this.updateState();
		return success;
	}

	dealReserve(): boolean {
		const success = this.game.dealReserve();
		if (success) this.updateState();
		return success;
	}

	undo(): void {
		this.game.undo();
		this.updateState();
	}

	private getState(): ScorpionGameState {
		return {
			tableau: this.game.tableau,
			reserve: this.game.reserve,
			reserveDealt: this.game.reserveDealt,
			isWon: this.game.isWon(),
			canUndo: this.game.canUndo,
			moveCount: this.game.moveCount
		};
	}

	private updateState(): void {
		this.gameState$.next(this.getState());
	}
}
