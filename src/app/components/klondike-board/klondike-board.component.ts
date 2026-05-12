import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KlondikeService, GameState } from '../../service/klondike.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';

@Component({
	selector: 'app-klondike-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './klondike-board.component.html',
	styleUrls: ['./klondike-board.component.scss']
})
export class KlondikeBoardComponent implements OnInit, OnDestroy {
	gameState!: GameState;
	private destroy$ = new Subject<void>();

	constructor(private klondikeService: KlondikeService) {}

	ngOnInit(): void {
		this.klondikeService.state$
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => {
				this.gameState = state;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onNewGame(): void {
		this.klondikeService.newGame();
	}

	onUndo(): void {
		this.klondikeService.undo();
	}

	onStockClick(): void {
		this.klondikeService.drawFromStock();
	}

	onWasteClick(event: { card: Card; index: number }): void {
		// Try to auto-move to foundation
		const wasteStack = this.klondikeService.getWasteStack();
		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(wasteStack, foundation, wasteStack.cards.length - 1)) {
				return;
			}
		}
	}

	onTableauClick(tableauIndex: number, event: { card: Card; index: number }): void {
		const tableau = this.klondikeService.getTableauStack(tableauIndex);
		
		// Try to move to foundation first
		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(tableau, foundation, event.index)) {
				return;
			}
		}
	}

	onFoundationClick(foundationIndex: number, event: { card: Card; index: number }): void {
		// Could implement moving from foundation back to tableau if needed
	}

	onTableauStackClick(tableauIndex: number): void {
		// Try to move from waste to empty tableau
		const tableau = this.klondikeService.getTableauStack(tableauIndex);
		if (tableau.cards.length === 0) {
			const waste = this.klondikeService.getWasteStack();
			if (waste.cards.length > 0) {
				this.klondikeService.moveCard(waste, tableau, waste.cards.length - 1);
			}
		}
	}

	onAutoComplete(): void {
		this.klondikeService.autoMoveToFoundations();
	}
}
