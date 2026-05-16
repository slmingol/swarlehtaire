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
	showRules = false;

	rulesInfo = {
		wikipediaUrl: 'https://en.wikipedia.org/wiki/Scorpion_(solitaire)',
		rules: [
			'Build down by suit (same suit descending)',
			'Move any face-up card with all cards below it',
			'Only Kings can fill empty columns',
			'Deal 3 reserve cards when stuck (one to each first 3 columns)',
			'Win by building 4 complete K-A sequences'
		]
	};

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

	toggleRules(): void {
		this.showRules = !this.showRules;
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

	onUndo(): void {
		this.scorpionService.undo();
	}
}
