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

	onAutoMove(): void {
		let moved = false;
		do {
			moved = this.freecellService.autoMoveToFoundations();
		} while (moved && !this.gameState.isWon);
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
}
