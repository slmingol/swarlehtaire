import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { YukonGame } from '../model/yukon-game';
import { Card } from '../model/card';

export interface YukonGameState {
	tableau: Card[][];
	foundations: Card[][];
	isWon: boolean;
	canUndo: boolean;
	moveCount: number;
}

@Injectable({
	providedIn: 'root'
})
export class YukonService {
	private game: YukonGame = new YukonGame();
	private gameState$ = new BehaviorSubject<YukonGameState>(this.getState());

	getGameState(): Observable<YukonGameState> {
		return this.gameState$.asObservable();
	}

	newGame(): void {
		this.game = new YukonGame();
		this.updateState();
	}

	moveCards(fromCol: number, cardIndex: number, toCol: number): boolean {
		const success = this.game.moveCards(fromCol, cardIndex, toCol);
		if (success) this.updateState();
		return success;
	}

	moveToFoundation(fromCol: number): boolean {
		const success = this.game.moveToFoundation(fromCol);
		if (success) this.updateState();
		return success;
	}

	undo(): void {
		this.game.undo();
		this.updateState();
	}

	private getState(): YukonGameState {
		return {
			tableau: this.game.tableau,
			foundations: this.game.foundations,
			isWon: this.game.isWon(),
			canUndo: this.game.canUndo,
			moveCount: this.game.moveCount
		};
	}

	private updateState(): void {
		this.gameState$.next(this.getState());
	}
}
