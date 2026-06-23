import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Card } from '../model/card';
import { ClockPile, ClockSolitaireGame } from '../model/clock-solitaire-game';

export interface ClockSolitaireGameState {
	piles: ClockPile[];
	currentPileIndex: number;
	lastCard: Card | null;
	kingsCount: number;
	gamePhase: 'playing' | 'won' | 'lost';
	moveCount: number;
}

@Injectable({ providedIn: 'root' })
export class ClockSolitaireService {
	private game = new ClockSolitaireGame();
	private state$ = new BehaviorSubject<ClockSolitaireGameState>(this.snapshot());

	getGameState(): Observable<ClockSolitaireGameState> {
		return this.state$.asObservable();
	}

	newGame(): void {
		this.game.newGame();
		this.push();
	}

	step(): void {
		this.game.step();
		this.push();
	}

	playAll(): void {
		this.game.playAll();
		this.push();
	}

	private snapshot(): ClockSolitaireGameState {
		return {
			piles: this.game.piles.map(p => ({
				faceDown: [...p.faceDown],
				faceUp: [...p.faceUp],
			})),
			currentPileIndex: this.game.currentPileIndex,
			lastCard: this.game.lastCard,
			kingsCount: this.game.kingsCount,
			gamePhase: this.game.gamePhase,
			moveCount: this.game.moveCount,
		};
	}

	private push(): void {
		this.state$.next(this.snapshot());
	}
}
