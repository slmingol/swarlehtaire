import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ClockSolitaireService, ClockSolitaireGameState } from '../../service/clock-solitaire.service';
import { ClockSolitaireGame, ClockPile } from '../../model/clock-solitaire-game';
import { CardSizeService } from '../../service/card-size.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';

@Component({
	selector: 'app-clock-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './clock-board.component.html',
	styleUrls: ['./clock-board.component.scss']
})
export class ClockBoardComponent implements OnInit, OnDestroy {
	gameState: ClockSolitaireGameState | null = null;
	showRules = false;
	private destroy$ = new Subject<void>();

	readonly pileLabels = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

	readonly pilePositions: { left: string; top: string }[] = Array.from({ length: 13 }, (_, i) => {
		if (i === 12) return { left: '50%', top: '50%' };
		const N = (i + 1) % 12;
		const rad = N * 30 * Math.PI / 180;
		const x = 50 + 40 * Math.sin(rad);
		const y = 50 - 40 * Math.cos(rad);
		return { left: `${x.toFixed(2)}%`, top: `${y.toFixed(2)}%` };
	});

	rulesInfo = {
		wikipediaUrl: 'https://en.wikipedia.org/wiki/Clock_(card_game)',
		rules: [
			'52 cards dealt face-down into 13 piles of 4 in a clock pattern (1-12 plus center for Kings)',
			'Flip the top card of the center (Kings) pile to start',
			'Place that card face-up at the position matching its rank (Ace=1, ..., Queen=12, King=center)',
			'Flip the top card at the new position and continue the chain',
			'Game ends when all 4 Kings are revealed',
			'Win only if all 48 non-King cards are face-up when the 4th King appears (~1 in 13 chance)',
			'No decisions to make - this is a game of pure chance!'
		]
	};

	constructor(
		private clockService: ClockSolitaireService,
		private cardSizeService: CardSizeService
	) {}

	ngOnInit(): void {
		this.cardSizeService.setColumns(14);
		this.clockService.getGameState()
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => this.gameState = state);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onClockFaceClick(): void {
		if (this.gameState?.gamePhase === 'playing') {
			this.clockService.step();
		}
	}

	newGame(): void {
		this.clockService.newGame();
	}

	step(): void {
		this.clockService.step();
	}

	playAll(): void {
		this.clockService.playAll();
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	getTopCard(pile: ClockPile): Card | null {
		if (pile.faceDown.length > 0) return pile.faceDown[pile.faceDown.length - 1];
		if (pile.faceUp.length > 0) return pile.faceUp[pile.faceUp.length - 1];
		return null;
	}

	pileLabel(index: number): string {
		return ClockSolitaireGame.pileLabel(index);
	}
}
