import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BakersDozenService, BakersDozenGameState } from '../../service/bakers-dozen.service';
import { StackComponent } from '../stack/stack.component';
import { CardSizeService } from '../../service/card-size.service';

@Component({
	selector: 'app-bakers-dozen-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './bakers-dozen-board.component.html',
	styleUrls: ['./bakers-dozen-board.component.scss']
})
export class BakersDozenBoardComponent implements OnInit, OnDestroy {
	gameState: BakersDozenGameState | null = null;
	dragSource: number | null = null;
	private destroy$ = new Subject<void>();
	showRules = false;

	rulesInfo = {
		wikipediaUrl: 'https://en.wikipedia.org/wiki/Baker%27s_Dozen_(solitaire)',
		rules: [
			'All 52 cards dealt face-up to 13 columns (4 each)',
			'Kings automatically moved to bottom during deal',
			'Build down by rank (suit doesn\'t matter)',
			'Move only top card of each column',
			'Empty columns CANNOT be filled'
		]
	};

	constructor(private bakersDozenService: BakersDozenService, private cardSizeService: CardSizeService) {}

	ngOnInit(): void {
		this.cardSizeService.setColumns(13);
		this.bakersDozenService.getGameState()
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => this.gameState = state);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	newGame(): void {
		this.bakersDozenService.newGame();
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	onDragStart(columnIndex: number, event: DragEvent): void {
		this.dragSource = columnIndex;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	onDragEnd(): void {
		this.dragSource = null;
	}

	onDrop(columnIndex: number, event: DragEvent): void {
		event.preventDefault();
		if (this.dragSource === null) return;

		this.bakersDozenService.moveCard(this.dragSource, columnIndex);
		this.dragSource = null;
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	onColumnDoubleClick(columnIndex: number): void {
		this.bakersDozenService.moveToFoundation(columnIndex);
	}
	onUndo(): void {
		this.bakersDozenService.undo();
	}}
