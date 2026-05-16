import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BakersDDozenGame } from '../model/bakers-dozen-game';
import { Card } from '../model/card';

export interface BakersDozenGameState {
	tableau: Card[][];
	foundations: Card[][];
	isWon: boolean;
	canUndo: boolean;
	moveCount: number;
}

@Injectable({
	providedIn: 'root'
})
export class BakersDozenService {
	private game: BakersDDozenGame = new BakersDDozenGame();
	private gameState$ = new BehaviorSubject<BakersDozenGameState>(this.getState());

	getGameState(): Observable<BakersDozenGameState> {
		return this.gameState$.asObservable();
	}

	newGame(): void {
		this.game = new BakersDDozenGame();
		this.updateState();
	}

	moveCard(fromCol: number, toCol: number): boolean {
		const success = this.game.moveCard(fromCol, toCol);
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

	private getState(): BakersDozenGameState {
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
