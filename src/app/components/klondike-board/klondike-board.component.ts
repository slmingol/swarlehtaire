import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KlondikeService, GameState } from '../../service/klondike.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';
import { GameVariant } from '../../model/klondike-game';
import { CardSizeService } from '../../service/card-size.service';

export interface VariantInfo {
	wikipediaUrl: string;
	rules: string[];
}

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

	// Rules panel state
	showRules = false;

	// Expose GameVariant enum to template
	GameVariant = GameVariant;
	variants = [
		GameVariant.KLONDIKE_DRAW_3,
		GameVariant.KLONDIKE_DRAW_1,
		GameVariant.EASTHAVEN,
		GameVariant.WESTCLIFF
	];

	// Variant information with Wikipedia links and rules
	variantInfo: Record<GameVariant, VariantInfo> = {
		[GameVariant.KLONDIKE_DRAW_3]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Klondike_(solitaire)',
			rules: [
				'Build foundations from Ace to King by suit',
				'Build tableau in descending rank, alternating colors',
				'Draw 3 cards at a time from stock',
				'Only Kings can be moved to empty tableau piles',
				'Win by moving all cards to foundations'
			]
		},
		[GameVariant.KLONDIKE_DRAW_1]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Klondike_(solitaire)',
			rules: [
				'Same as Draw 3, but draw only 1 card at a time',
				'Build foundations from Ace to King by suit',
				'Build tableau in descending rank, alternating colors',
				'Only Kings can be moved to empty tableau piles',
				'Easier variant with higher win rate'
			]
		},
		[GameVariant.EASTHAVEN]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Easthaven',
			rules: [
				'All tableau cards start face-up for complete information',
				'Build foundations from Ace to King by suit',
				'Build tableau in descending rank, alternating colors',
				'Draw 3 cards at a time from stock',
				'Strategic variant - you can see everything from the start'
			]
		},
		[GameVariant.WESTCLIFF]: {
			wikipediaUrl: 'https://en.wikipedia.org/wiki/Westcliff_(card_game)',
			rules: [
				'10 tableau piles with 3 cards each, only top card face-up',
				'Build foundations from Ace to King by suit',
				'Build tableau in descending rank, alternating colors',
				'Draw 1 card at a time from stock (22 cards)',
				'Very easy variant - 9 in 10 chance of winning!'
			]
		}
	};

	constructor(private klondikeService: KlondikeService, private cardSizeService: CardSizeService) {}

	ngOnInit(): void {
		this.cardSizeService.setColumns(7);
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

	get currentVariantInfo(): VariantInfo | undefined {
		return this.gameState?.variant ? this.variantInfo[this.gameState.variant] : undefined;
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	private get isDrawThree(): boolean {
		return this.gameState?.variant === GameVariant.KLONDIKE_DRAW_3 ||
			this.gameState?.variant === GameVariant.EASTHAVEN;
	}

	get wasteSpread(): 'none' | 'right' {
		if (window.innerWidth <= 499) return 'none';
		return this.isDrawThree ? 'right' : 'none';
	}

	get visibleWasteCards(): Card[] {
		if (!this.gameState?.waste || this.gameState.waste.length === 0) return [];
		const waste = this.gameState.waste;
		const count = this.isDrawThree ? 3 : 1;
		return waste.slice(Math.max(0, waste.length - count)).map(card => ({ ...card, faceUp: true }));
	}

	onNewGame(): void {
		this.klondikeService.newGame();
	}

	onVariantChange(event: Event): void {
		const select = event.target as HTMLSelectElement;
		const variant = select.value as GameVariant;
		this.klondikeService.changeVariant(variant);
	}

	onUndo(): void {
		this.klondikeService.undo();
	}

	onStockClick(): void {
		this.klondikeService.drawFromStock();
	}

	onWasteClick(_event: { card: Card; index: number }): void {
		const wasteStack = this.klondikeService.getWasteStack();
		const topCardIndex = wasteStack.cards.length - 1;
		if (topCardIndex < 0) return;

		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(wasteStack, foundation, topCardIndex)) return;
		}

		for (let i = 0; i < this.gameState.tableau.length; i++) {
			const tableau = this.klondikeService.getTableauStack(i);
			if (this.klondikeService.moveCard(wasteStack, tableau, topCardIndex)) return;
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
		for (let i = 0; i < this.gameState.tableau.length; i++) {
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
				// Move the top card (last card in waste)
				this.klondikeService.moveCard(waste, tableau, waste.cards.length - 1);
			}
		}
	}

	onAutoComplete(): void {
		// Keep moving cards until no more moves are possible
		let moved = 0;
		do {
			moved = this.klondikeService.autoMoveToFoundations();
		} while (moved > 0);
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
		let actualCardIndex = this.dragSource.cardIndex;
		
		if (this.dragSource.type === 'tableau') {
			sourceStack = this.klondikeService.getTableauStack(this.dragSource.index);
		} else if (this.dragSource.type === 'waste') {
			sourceStack = this.klondikeService.getWasteStack();
			actualCardIndex = sourceStack.cards.length - 1;
			if (actualCardIndex < 0) {
				this.dragSource = null;
				return;
			}
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

		this.klondikeService.moveCard(sourceStack, targetStack, actualCardIndex);
		this.dragSource = null;
	}
}
