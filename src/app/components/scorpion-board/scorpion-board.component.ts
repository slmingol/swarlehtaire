import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ScorpionService, ScorpionGameState } from '../../service/scorpion.service';
import { StackComponent } from '../stack/stack.component';

@Component({
	selector: 'app-scorpion-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './scorpion-board.component.html',
	styleUrls: ['./scorpion-board.component.scss']
})
export class ScorpionBoardComponent implements OnInit, OnDestroy {
	gameState: ScorpionGameState | null = null;
	dragSource: {columnIndex: number, cardIndex: number} | null = null;
	private destroy$ = new Subject<void>();

	constructor(private scorpionService: ScorpionService) {}

	ngOnInit(): void {
		this.scorpionService.getGameState()
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => this.gameState = state);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	newGame(): void {
		this.scorpionService.newGame();
	}

	onDragStart(columnIndex: number, cardIndex: number, event: DragEvent): void {
		this.dragSource = {columnIndex, cardIndex};
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	onDragEnd(): void {
		this.dragSource = null;
	}

	onDrop(columnIndex: number, event: DragEvent): void {
		event.preventDefault();
		if (!this.dragSource) return;

		this.scorpionService.moveCards(
			this.dragSource.columnIndex,
			this.dragSource.cardIndex,
			columnIndex
		);
		this.dragSource = null;
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	dealReserve(): void {
		this.scorpionService.dealReserve();
	}
}
