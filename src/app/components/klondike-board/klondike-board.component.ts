import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KlondikeService, GameState } from '../../service/klondike.service';
import { StackComponent } from '../stack/stack.component';
import { Card } from '../../model/card';
import { GameVariant } from '../../model/klondike-game';

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
				'Uses 10 tableau piles instead of 7',
				'Build foundations from Ace to King by suit',
				'Build tableau in descending rank, alternating colors',
				'Draw 3 cards at a time from stock',
				'More complex with additional tableau piles'
			]
		}
	};

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

	get currentVariantInfo(): VariantInfo | undefined {
		return this.gameState?.variant ? this.variantInfo[this.gameState.variant] : undefined;
	}

	toggleRules(): void {
		this.showRules = !this.showRules;
	}

	get visibleWasteCards(): Card[] {
		// Show all waste cards, but only the top 3 are face-up
		if (!this.gameState?.waste) return [];
		const waste = this.gameState.waste;
		
		// Create display cards with modified faceUp property
		return waste.map((card, index) => {
			const isTopThree = index >= waste.length - 3;
			return { ...card, faceUp: isTopThree };
		});
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

	onWasteClick(event: { card: Card; index: number }): void {
		const wasteStack = this.klondikeService.getWasteStack();
		// Use the actual index since we're showing all cards
		const actualIndex = event.index;
		
		// Try to move to foundation
		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(wasteStack, foundation, actualIndex)) {
				return;
			}
		}
		
		// Try to move to tableau
		for (let i = 0; i < this.gameState.tableau.length; i++) {
			const tableau = this.klondikeService.getTableauStack(i);
			if (this.klondikeService.moveCard(wasteStack, tableau, actualIndex)) {
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
		let actualCardIndex = this.dragSource.cardIndex;
		
		if (this.dragSource.type === 'tableau') {
			sourceStack = this.klondikeService.getTableauStack(this.dragSource.index);
		} else if (this.dragSource.type === 'waste') {
			sourceStack = this.klondikeService.getWasteStack();
			// Use the actual index since we're showing all cards
			actualCardIndex = this.dragSource.cardIndex;
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
