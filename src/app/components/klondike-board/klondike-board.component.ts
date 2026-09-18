import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KlondikeService, GameState } from '../../service/klondike.service';
import { StackComponent } from '../stack/stack.component';
import { Card, Suit } from '../../model/card';
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
	private dragFromRect: DOMRect | null = null;

	// Card IDs hidden during fly animation — new Set ref on each change so Angular input detects it
	flyingCardIds: Set<string> = new Set();

	// Rules panel state
	showRules = false;

	// Win animation
	rainItems: { id: number; suit: string; left: string; delay: string; duration: string }[] = [];

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

	constructor(
		private klondikeService: KlondikeService,
		private cardSizeService: CardSizeService,
		private ngZone: NgZone
	) {}

	ngOnInit(): void {
		this.cardSizeService.setColumns(7);
		this.klondikeService.state$
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => {
				if (state.isWon && !this.gameState?.isWon) {
					this.rainItems = this.generateRainItems();
				} else if (!state.isWon) {
					this.rainItems = [];
				}
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

	private captureCardRect(cardId: string): DOMRect | null {
		const el = document.querySelector(`[data-card-id="${cardId}"]`);
		return el ? el.getBoundingClientRect() : null;
	}

	private startFly(card: Card, fromRect: DOMRect, count = 1): void {
		this.flyingCardIds = new Set([...this.flyingCardIds, card.id]);

		const revealCard = () => {
			this.ngZone.run(() => {
				this.flyingCardIds = new Set([...this.flyingCardIds].filter(id => id !== card.id));
			});
		};

		// Run animation work outside Angular zone to avoid triggering extra CD cycles
		this.ngZone.runOutsideAngular(() => {
			setTimeout(() => {
				const newEl = document.querySelector(`[data-card-id="${card.id}"]`) as HTMLElement | null;
				const toRect = newEl?.getBoundingClientRect();

				if (!newEl || !toRect ||
					(Math.abs(toRect.left - fromRect.left) < 2 && Math.abs(toRect.top - fromRect.top) < 2)) {
					revealCard();
					return;
				}

				const cardH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-h').trim()) || 163;
				const height = Math.min(cardH + (count - 1) * 28, cardH * 2.5);
				const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

				const fly = document.createElement('div');
				fly.style.cssText = [
					'position:fixed',
					`width:${fromRect.width}px`,
					`height:${height}px`,
					`left:${fromRect.left}px`,
					`top:${fromRect.top}px`,
					'pointer-events:none',
					'z-index:10000',
					'background:white',
					'border:1px solid #ccc',
					'border-radius:12px',
					'box-shadow:0 8px 24px rgba(0,0,0,0.35)',
					'display:flex',
					'align-items:flex-start',
					'padding:4px 6px',
					`color:${isRed ? '#dc143c' : '#000'}`,
					'font-size:16px',
					'font-weight:bold',
					'will-change:transform',
					'transition:transform 0.22s cubic-bezier(0.2,0,0.2,1)',
				].join(';');
				document.body.appendChild(fly);

				fly.getBoundingClientRect(); // force reflow
				fly.style.transform = `translate(${toRect.left - fromRect.left}px,${toRect.top - fromRect.top}px)`;

				setTimeout(() => {
					fly.remove();
					revealCard();
				}, 240);
			}, 0);
		});
	}

	onWasteClick(_event: { card: Card; index: number }): void {
		const wasteStack = this.klondikeService.getWasteStack();
		const topCardIndex = wasteStack.cards.length - 1;
		if (topCardIndex < 0) return;
		const topCard = wasteStack.cards[topCardIndex];
		const fromRect = this.captureCardRect(topCard.id);

		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(wasteStack, foundation, topCardIndex)) {
				if (fromRect) this.startFly(topCard, fromRect);
				return;
			}
		}

		for (let i = 0; i < this.gameState.tableau.length; i++) {
			const tableau = this.klondikeService.getTableauStack(i);
			if (this.klondikeService.moveCard(wasteStack, tableau, topCardIndex)) {
				if (fromRect) this.startFly(topCard, fromRect);
				return;
			}
		}
	}

	onTableauClick(tableauIndex: number, event: { card: Card; index: number }): void {
		const tableau = this.klondikeService.getTableauStack(tableauIndex);
		const count = tableau.cards.length - event.index;
		const fromRect = this.captureCardRect(event.card.id);

		for (let i = 0; i < 4; i++) {
			const foundation = this.klondikeService.getFoundationStack(i);
			if (this.klondikeService.moveCard(tableau, foundation, event.index)) {
				if (fromRect) this.startFly(event.card, fromRect, count);
				return;
			}
		}

		for (let i = 0; i < this.gameState.tableau.length; i++) {
			if (i !== tableauIndex) {
				const targetTableau = this.klondikeService.getTableauStack(i);
				if (this.klondikeService.moveCard(tableau, targetTableau, event.index)) {
					if (fromRect) this.startFly(event.card, fromRect, count);
					return;
				}
			}
		}
	}

	onFoundationClick(_foundationIndex: number, _event: { card: Card; index: number }): void {}

	onTableauStackClick(tableauIndex: number): void {
		const tableau = this.klondikeService.getTableauStack(tableauIndex);
		if (tableau.cards.length === 0) {
			const waste = this.klondikeService.getWasteStack();
			if (waste.cards.length > 0) {
				const topCard = waste.cards[waste.cards.length - 1];
				const fromRect = this.captureCardRect(topCard.id);
				if (this.klondikeService.moveCard(waste, tableau, waste.cards.length - 1)) {
					if (fromRect) this.startFly(topCard, fromRect);
				}
			}
		}
	}

	private generateRainItems() {
		const suits = ['♠', '♥', '♦', '♣'];
		return Array.from({ length: 35 }, (_, i) => ({
			id: i,
			suit: suits[i % 4],
			left: `${Math.random() * 94}%`,
			delay: `${(Math.random() * 4).toFixed(2)}s`,
			duration: `${(2 + Math.random() * 2).toFixed(2)}s`
		}));
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
		let cardId: string | undefined;
		if (source.type === 'tableau') {
			cardId = this.klondikeService.getTableauStack(source.index).cards[source.cardIndex]?.id;
		} else if (source.type === 'waste') {
			const waste = this.klondikeService.getWasteStack();
			cardId = waste.cards[waste.cards.length - 1]?.id;
		} else if (source.type === 'foundation') {
			cardId = this.klondikeService.getFoundationStack(source.index).cards[source.cardIndex]?.id;
		}
		this.dragFromRect = cardId ? this.captureCardRect(cardId) : null;
	}

	onDragEnd(): void {
		this.dragSource = null;
		this.dragFromRect = null;
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
				this.dragFromRect = null;
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

		const movedCard = sourceStack.cards[actualCardIndex];
		const fromRect = this.dragFromRect;
		const count = sourceStack.cards.length - actualCardIndex;
		if (this.klondikeService.moveCard(sourceStack, targetStack, actualCardIndex) && fromRect && movedCard) {
			this.startFly(movedCard, fromRect, count);
		}
		this.dragSource = null;
		this.dragFromRect = null;
	}
}
