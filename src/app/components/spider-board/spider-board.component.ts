import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SpiderService, SpiderGameState } from '../../service/spider.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';
import { SpiderVariant } from '../../model/spider-game';
import { CardSizeService } from '../../service/card-size.service';

export interface VariantInfo {
	wikipediaUrl: string;
	rules: string[];
}

@Component({
	selector: 'app-spider-board',
	standalone: true,
	imports: [CommonModule, StackComponent],
	templateUrl: './spider-board.component.html',
	styleUrls: ['./spider-board.component.scss']
})
export class SpiderBoardComponent implements OnInit, OnDestroy {
	gameState!: SpiderGameState;
	private destroy$ = new Subject<void>();
	
	// Drag state
	dragSource: { pileIndex: number; cardIndex: number } | null = null;

	// Rules panel state
	showRules = false;

	// Expose SpiderVariant enum to template
	SpiderVariant = SpiderVariant;
	variants = [
		SpiderVariant.ONE_SUIT,
		SpiderVariant.TWO_SUIT,
		SpiderVariant.FOUR_SUIT
	];

	// Variant information with Wikipedia links and rules
	variantInfo: Record<SpiderVariant, VariantInfo> = {
		[SpiderVariant.ONE_SUIT]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Spider_(solitaire)',
			rules: [
				'All cards are spades - easiest variant',
				'Build down by rank (any suit accepted)',
				'Move in-suit sequences together as a unit',
				'Complete K-A sequences are removed (8 needed)',
				'Deal 10 cards when stuck (all piles must have cards)'
			]
		},
		[SpiderVariant.TWO_SUIT]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Spider_(solitaire)',
			rules: [
				'Uses spades and hearts - medium difficulty',
				'Build down by rank (any suit accepted)',
				'Move in-suit sequences together as a unit',
				'Complete K-A sequences are removed (8 needed)',
				'Deal 10 cards when stuck (all piles must have cards)'
			]
		},
		[SpiderVariant.FOUR_SUIT]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Spider_(solitaire)',
			rules: [
				'All 4 suits - hardest variant, ~1 in 3 win rate',
				'Build down by rank (any suit accepted)',
				'Move in-suit sequences together as a unit',
				'Complete K-A sequences are removed (8 needed)',
				'Deal 10 cards when stuck (all piles must have cards)'
			]
		}
	};

	constructor(private spiderService: SpiderService, private cardSizeService: CardSizeService) {}

	ngOnInit(): void {
		this.cardSizeService.setColumns(10);
		this.spiderService.state$
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => {
				this.gameState = state;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	get currentVariantInfo(): VariantInfo | undefined {
		return this.gameState?.variant ? this.variantInfo[this.gameState.variant] : undefined;
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	onNewGame(): void {
		this.spiderService.newGame();
	}

	onVariantChange(event: Event): void {
		const select = event.target as HTMLSelectElement;
		const variant = select.value as SpiderVariant;
		this.spiderService.changeVariant(variant);
	}

	onDealFromStock(): void {
		this.spiderService.dealFromStock();
	}

	onUndo(): void {
		this.spiderService.undo();
	}

	onTableauClick(pileIndex: number, event: { card: Card; index: number }): void {
		// Implement auto-move logic later
	}

	// Drag and Drop handlers
	onDragStart(source: { pileIndex: number; cardIndex: number }): void {
		this.dragSource = source;
	}

	onDragEnd(): void {
		this.dragSource = null;
	}

	onDrop(targetPileIndex: number): void {
		if (!this.dragSource) return;

		this.spiderService.moveCards(
			this.dragSource.pileIndex,
			this.dragSource.cardIndex,
			targetPileIndex
		);

		this.dragSource = null;
	}
}
