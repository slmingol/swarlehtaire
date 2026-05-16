import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FreeCellGame } from '../model/freecell-game';
import { Card } from '../model/card';

export interface FreeCellGameState {
	cascades: Card[][];
	cells: (Card | null)[];
	foundations: Card[][];
	emptyCells: number;
	emptyCascades: number;
	isWon: boolean;
	moveCount: number;
	canUndo: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class FreeCellService {
	private game!: FreeCellGame;
	private gameState$ = new BehaviorSubject<FreeCellGameState>(this.getInitialState());

	constructor() {
		this.newGame();
	}

	get state$(): Observable<FreeCellGameState> {
		return this.gameState$.asObservable();
	}

	private getInitialState(): FreeCellGameState {
		return {
			cascades: Array.from({ length: 8 }, () => []),
			cells: Array.from({ length: 4 }, () => null),
			foundations: Array.from({ length: 4 }, () => []),
			emptyCells: 4,
			emptyCascades: 0,
			isWon: false,
			moveCount: 0,
			canUndo: false
		};
	}

	newGame(): void {
		if (!this.game) {
			this.game = new FreeCellGame();
		} else {
			this.game.newGame();
		}
		this.updateState();
	}

	moveCascade(fromIndex: number, cardIndex: number, toIndex: number): boolean {
		const success = this.game.moveCascade(fromIndex, cardIndex, toIndex);
		if (success) this.updateState();
		return success;
	}

	moveToCell(fromCascade: number, cellIndex: number): boolean {
		const success = this.game.moveToCell('cascade', fromCascade, cellIndex);
		if (success) this.updateState();
		return success;
	}

	moveCellToCascade(cellIndex: number, cascadeIndex: number): boolean {
		const success = this.game.moveCellToCascade(cellIndex, cascadeIndex);
		if (success) this.updateState();
		return success;
	}

	moveToFoundation(card: Card, from: 'cell' | 'cascade', fromIndex: number): boolean {
		const success = this.game.moveToFoundation(card, from, fromIndex);
		if (success) this.updateState();
		return success;
	}

	autoMoveToFoundations(): boolean {
		const moved = this.game.autoMoveToFoundations();
		if (moved > 0) this.updateState();
		return moved > 0;
	}

	undo(): void {
		this.game.undo();
		this.updateState();
	}

	private updateState(): void {
		const state: FreeCellGameState = {
			cascades: this.game.cascades.map(c => [...c]),
			cells: [...this.game.cells],
			foundations: this.game.foundations.map(f => [...f]),
			emptyCells: this.game.emptyCells,
			emptyCascades: this.game.emptyCascades,
			isWon: this.game.isWon(),
			moveCount: this.game.moveCount,
			canUndo: this.game.canUndo
		};
		this.gameState$.next(state);
	}
}
