import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { YukonService, YukonGameState } from '../../service/yukon.service';
import { StackComponent } from '../stack/stack.component';

@Component({
	selector: 'app-yukon-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './yukon-board.component.html',
	styleUrls: ['./yukon-board.component.scss']
})
export class YukonBoardComponent implements OnInit, OnDestroy {
	gameState: YukonGameState | null = null;
	dragSource: {columnIndex: number, cardIndex: number} | null = null;
	private destroy$ = new Subject<void>();
	showRules = false;

	rulesInfo = {
		wikipediaUrl: 'https://en.wikipedia.org/wiki/Yukon_(solitaire)',
		rules: [
			'All cards dealt face-up at start',
			'Build down by alternating colors on tableau',
			'Move any face-up card (not just sequences)',
			'Build up by suit on foundations (Ace to King)',
			'Only Kings can fill empty columns'
		]
	};

	constructor(private yukonService: YukonService) {}

	ngOnInit(): void {
		this.yukonService.getGameState()
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => this.gameState = state);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	newGame(): void {
		this.yukonService.newGame();
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

		this.yukonService.moveCards(
			this.dragSource.columnIndex,
			this.dragSource.cardIndex,
			columnIndex
		);
		this.dragSource = null;
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	onColumnDoubleClick(columnIndex: number): void {
		this.yukonService.moveToFoundation(columnIndex);
	}
}
