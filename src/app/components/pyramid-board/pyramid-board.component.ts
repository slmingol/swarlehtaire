import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PyramidService, PyramidGameState } from '../../service/pyramid.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';
import { CardSizeService } from '../../service/card-size.service';

@Component({
	selector: 'app-pyramid-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './pyramid-board.component.html',
	styleUrls: ['./pyramid-board.component.scss']
})
export class PyramidBoardComponent implements OnInit, OnDestroy {
	gameState: PyramidGameState | null = null;
	selectedCard: {row: number, col: number} | null = null;
	private destroy$ = new Subject<void>();
	showRules = false;

	rulesInfo = {
		wikipediaUrl: 'https://en.wikipedia.org/wiki/Pyramid_(solitaire)',
		rules: [
			'Remove pairs of cards that add up to 13',
			'Kings = 13 (remove alone), Queens = 12, Jacks = 11',
			'Only exposed cards (not covered) can be removed',
			'Draw from 24-card stock when stuck',
			'Win by clearing entire pyramid'
		]
	};

	constructor(private pyramidService: PyramidService, private cardSizeService: CardSizeService) {}

	ngOnInit(): void {
		this.cardSizeService.setColumns(7);
		this.pyramidService.getGameState()
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => this.gameState = state);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	newGame(): void {
		this.selectedCard = null;
		this.pyramidService.newGame();
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	onPyramidCardClick(row: number, col: number): void {
		if (!this.gameState) return;
		
		const card = this.gameState.pyramid[row][col];
		if (!card) return;

		// Check if it's a King
		if (card.rank === 12) { // KING
			this.pyramidService.removeKing(row, col);
			return;
		}

		// If first selection
		if (!this.selectedCard) {
			this.selectedCard = {row, col};
			return;
		}

		// If same card clicked, deselect
		if (this.selectedCard.row === row && this.selectedCard.col === col) {
			this.selectedCard = null;
			return;
		}

		// Try to pair with selected card
		const success = this.pyramidService.removePyramidPair(
			this.selectedCard.row, this.selectedCard.col, row, col
		);
		
		this.selectedCard = null;
	}

	onWasteClick(): void {
		if (!this.gameState || !this.gameState.waste) return;

		// If pyramid card selected, try pairing
		if (this.selectedCard) {
			this.pyramidService.removeWastePyramidPair(
				this.selectedCard.row, this.selectedCard.col
			);
			this.selectedCard = null;
		}
	}

	onStockClick(): void {
		this.pyramidService.drawFromStock();
	}

	isCardSelected(row: number, col: number): boolean {
		return !!this.selectedCard && 
			   this.selectedCard.row === row && 
			   this.selectedCard.col === col;
	}

	getCardValue(card: Card): number {
		const values: {[key: number]: number} = {
			0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7,
			7: 8, 8: 9, 9: 10, 10: 11, 11: 12, 12: 13
		};
		return values[card.rank] || 0;
	}
}
