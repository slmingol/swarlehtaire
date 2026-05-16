import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FreeCellService, FreeCellGameState } from '../../service/freecell.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';

@Component({
	selector: 'app-freecell-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './freecell-board.component.html',
	styleUrls: ['./freecell-board.component.scss']
})
export class FreeCellBoardComponent implements OnInit, OnDestroy {
	gameState!: FreeCellGameState;
	private destroy$ = new Subject<void>();
	dragSource: { type: 'cascade' | 'cell'; index: number; cardIndex?: number } | null = null;
	showRules = false;

	rulesInfo = {
		wikipediaUrl: 'https://en.wikipedia.org/wiki/FreeCell',
		rules: [
			'All 52 cards dealt face-up to 8 cascades (4×7, 4×6)',
			'Build down by alternating colors on cascades',
			'Build up by suit on foundations (Ace to King)',
			'Use 4 free cells for temporary card storage',
			'Move sequences based on empty cells/cascades: C = 2^M × (N+1)',
			'Almost all games are solvable with perfect play'
		]
	};

	constructor(private freecellService: FreeCellService) {}

	ngOnInit(): void {
		this.freecellService.state$
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => this.gameState = state);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onNewGame(): void {
		this.freecellService.newGame();
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	onAutoMove(): void {
		// Keep auto-moving until no more moves are possible
		let moved = true;
		while (moved) {
			moved = this.freecellService.autoMoveToFoundations();
		}
	}
	onUndo(): void {
		this.freecellService.undo();
	}
	onCascadeDragStart(cascadeIndex: number, cardIndex: number): void {
		this.dragSource = { type: 'cascade', index: cascadeIndex, cardIndex };
	}

	onCellDragStart(cellIndex: number): void {
		this.dragSource = { type: 'cell', index: cellIndex };
	}

	onDragEnd(): void {
		this.dragSource = null;
	}

	onCascadeDrop(targetIndex: number): void {
		if (!this.dragSource) return;

		if (this.dragSource.type === 'cascade' && this.dragSource.cardIndex !== undefined) {
			this.freecellService.moveCascade(this.dragSource.index, this.dragSource.cardIndex, targetIndex);
		} else if (this.dragSource.type === 'cell') {
			this.freecellService.moveCellToCascade(this.dragSource.index, targetIndex);
		}
		this.dragSource = null;
	}

	onCellDrop(cellIndex: number): void {
		if (!this.dragSource) return;

		// Only allow moving from cascade to cell (one card at a time)
		if (this.dragSource.type === 'cascade' && this.dragSource.cardIndex !== undefined) {
			const cascade = this.gameState.cascades[this.dragSource.index];
			// Only allow moving the top card (last card in cascade)
			if (this.dragSource.cardIndex === cascade.length - 1) {
				this.freecellService.moveToCell(this.dragSource.index, cellIndex);
			}
		}
		this.dragSource = null;
	}

	onCellClick(cellIndex: number): void {
		// Try to move to foundation or empty cascade
		const card = this.gameState.cells[cellIndex];
		if (card) {
			this.freecellService.moveToFoundation(card, 'cell', cellIndex);
		}
	}

	onCascadeClick(cascadeIndex: number, cardIndex: number): void {
		const cascade = this.gameState.cascades[cascadeIndex];
		if (cardIndex === cascade.length - 1) {
			const card = cascade[cardIndex];
			this.freecellService.moveToFoundation(card, 'cascade', cascadeIndex);
		}
	}

	onFoundationDrop(foundationIndex: number): void {
		if (!this.dragSource) return;

		if (this.dragSource.type === 'cell') {
			// Move from cell to foundation
			const card = this.gameState.cells[this.dragSource.index];
			if (card) {
				this.freecellService.moveToFoundation(card, 'cell', this.dragSource.index);
			}
		} else if (this.dragSource.type === 'cascade' && this.dragSource.cardIndex !== undefined) {
			// Move from cascade to foundation (only top card)
			const cascade = this.gameState.cascades[this.dragSource.index];
			if (this.dragSource.cardIndex === cascade.length - 1) {
				const card = cascade[this.dragSource.cardIndex];
				this.freecellService.moveToFoundation(card, 'cascade', this.dragSource.index);
			}
		}
		this.dragSource = null;
	}
}
