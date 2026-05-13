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
	
	// Drag state
	dragSource: { type: 'tableau' | 'waste' | 'foundation'; index: number; cardIndex: number } | null = null;

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
		const wasteStack = this.klondikeService.getWasteStack();
		const cardIndex = wasteStack.cards.length - 1;
		
		// Try to move to foundation
		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(wasteStack, foundation, cardIndex)) {
				return;
			}
		}
		
		// Try to move to tableau
		for (let i = 0; i < 7; i++) {
			const tableau = this.klondikeService.getTableauStack(i);
			if (this.klondikeService.moveCard(wasteStack, tableau, cardIndex)) {
				return;
			}
		}
	}

	onTableauClick(tableauIndex: number, event: { card: Card; index: number }): void {
		const tableau = this.klondikeService.getTableauStack(tableauIndex);
		
		// Try to move to foundation
		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(tableau, foundation, event.index)) {
				return;
			}
		}
		
		// Try to move to another tableau
		for (let i = 0; i < 7; i++) {
			if (i !== tableauIndex) {
				const targetTableau = this.klondikeService.getTableauStack(i);
				if (this.klondikeService.moveCard(tableau, targetTableau, event.index)) {
					return;
				}
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
		// Keep moving cards until no more moves are possible
		let totalMoved = 0;
		let moved = 0;
		do {
			moved = this.klondikeService.autoMoveToFoundations();
			totalMoved += moved;
		} while (moved > 0 && !this.gameState.isWon);
	}

	// Drag and Drop handlers
	onDragStart(source: { type: 'tableau' | 'waste' | 'foundation'; index: number; cardIndex: number }): void {
		this.dragSource = source;
	}

	onDragEnd(): void {
		this.dragSource = null;
	}

	onDrop(target: { type: 'tableau' | 'foundation'; index: number }): void {
		if (!this.dragSource) return;

		let sourceStack;
		if (this.dragSource.type === 'tableau') {
			sourceStack = this.klondikeService.getTableauStack(this.dragSource.index);
		} else if (this.dragSource.type === 'waste') {
			sourceStack = this.klondikeService.getWasteStack();
		} else if (this.dragSource.type === 'foundation') {
			sourceStack = this.klondikeService.getFoundationStack(this.dragSource.index);
		} else {
			return;
		}

		let targetStack;
		if (target.type === 'tableau') {
			targetStack = this.klondikeService.getTableauStack(target.index);
		} else if (target.type === 'foundation') {
			targetStack = this.klondikeService.getFoundationStack(target.index);
		} else {
			return;
		}

		this.klondikeService.moveCard(sourceStack, targetStack, this.dragSource.cardIndex);
		this.dragSource = null;
	}
}
