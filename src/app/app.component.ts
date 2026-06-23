import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KlondikeBoardComponent } from './components/klondike-board/klondike-board.component';
import { SpiderBoardComponent } from './components/spider-board/spider-board.component';
import { FreeCellBoardComponent } from './components/freecell-board/freecell-board.component';
import { PyramidBoardComponent } from './components/pyramid-board/pyramid-board.component';
import { ScorpionBoardComponent } from './components/scorpion-board/scorpion-board.component';
import { YukonBoardComponent } from './components/yukon-board/yukon-board.component';
import { BakersDozenBoardComponent } from './components/bakers-dozen-board/bakers-dozen-board.component';
import { ClockBoardComponent } from './components/clock-board/clock-board.component';
import { VersionDisplayComponent } from './components/version-display/version-display.component';
import { KlondikeService } from './service/klondike.service';
import { FreeCellService } from './service/freecell.service';
import { PyramidService } from './service/pyramid.service';
import { SpiderService } from './service/spider.service';
import { ScorpionService } from './service/scorpion.service';
import { YukonService } from './service/yukon.service';
import { BakersDozenService } from './service/bakers-dozen.service';
import { ClockSolitaireService } from './service/clock-solitaire.service';

export enum GameType {
	KLONDIKE = 'Klondike',
	SPIDER = 'Spider',
	FREECELL = 'FreeCell',
	PYRAMID = 'Pyramid',
	SCORPION = 'Scorpion',
	YUKON = 'Yukon',
	BAKERS_DOZEN = 'Baker\'s Dozen',
	CLOCK = 'Clock'
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	host: { '(document:keydown)': 'handleKeyDown($event)' },
	imports: [CommonModule, KlondikeBoardComponent, SpiderBoardComponent, FreeCellBoardComponent, PyramidBoardComponent, ScorpionBoardComponent, YukonBoardComponent, BakersDozenBoardComponent, ClockBoardComponent, VersionDisplayComponent]
})
export class AppComponent {
	title = 'Swarlehtaire';
	currentGame: GameType = GameType.KLONDIKE;
	GameType = GameType;
	gameTypes = [GameType.KLONDIKE, GameType.SPIDER, GameType.FREECELL, GameType.PYRAMID, GameType.SCORPION, GameType.YUKON, GameType.BAKERS_DOZEN, GameType.CLOCK];
	showHelp = false;

	private klondike = inject(KlondikeService);
	private freeCell = inject(FreeCellService);
	private pyramid = inject(PyramidService);
	private spider = inject(SpiderService);
	private scorpion = inject(ScorpionService);
	private yukon = inject(YukonService);
	private bakersDozen = inject(BakersDozenService);
	private clockSolitaire = inject(ClockSolitaireService);

	selectGame(game: GameType): void {
		this.currentGame = game;
	}

	handleKeyDown(event: KeyboardEvent): void {
		const target = event.target;
		if (target instanceof Element && target.nodeName.toLowerCase() === 'input') return;

		if (event.key === 'Escape') {
			this.showHelp = false;
			return;
		}

		if (event.key === '?') {
			this.showHelp = !this.showHelp;
			event.preventDefault();
			return;
		}

		if (this.showHelp) return;

		const key = event.key.toLowerCase();
		const isUndo = key === 'u' || (event.ctrlKey && key === 'z');

		if (key === 'n') {
			this.newGame();
		} else if (isUndo) {
			this.undo();
		} else if (key === 'd' || key === ' ') {
			this.drawFromStock();
		} else if (key === 'a') {
			this.autoComplete();
		} else if (key === 'w') {
			this.placeWasteCard();
		} else {
			return;
		}
		event.preventDefault();
	}

	private newGame(): void {
		switch (this.currentGame) {
			case GameType.KLONDIKE: this.klondike.newGame(); break;
			case GameType.SPIDER: this.spider.newGame(); break;
			case GameType.FREECELL: this.freeCell.newGame(); break;
			case GameType.PYRAMID: this.pyramid.newGame(); break;
			case GameType.SCORPION: this.scorpion.newGame(); break;
			case GameType.YUKON: this.yukon.newGame(); break;
			case GameType.BAKERS_DOZEN: this.bakersDozen.newGame(); break;
			case GameType.CLOCK: this.clockSolitaire.newGame(); break;
		}
	}

	private undo(): void {
		switch (this.currentGame) {
			case GameType.KLONDIKE: this.klondike.undo(); break;
			case GameType.SPIDER: this.spider.undo(); break;
			case GameType.FREECELL: this.freeCell.undo(); break;
			case GameType.SCORPION: this.scorpion.undo(); break;
			case GameType.YUKON: this.yukon.undo(); break;
			case GameType.BAKERS_DOZEN: this.bakersDozen.undo(); break;
		}
	}

	private drawFromStock(): void {
		switch (this.currentGame) {
			case GameType.KLONDIKE: this.klondike.drawFromStock(); break;
			case GameType.PYRAMID: this.pyramid.drawFromStock(); break;
			case GameType.CLOCK: this.clockSolitaire.step(); break;
		}
	}

	private placeWasteCard(): void {
		if (this.currentGame !== GameType.KLONDIKE) return;
		const waste = this.klondike.getWasteStack();
		const topIndex = waste.cards.length - 1;
		if (topIndex < 0) return;
		for (let i = 0; i < 4; i++) {
			if (this.klondike.moveCard(waste, this.klondike.getFoundationStack(i), topIndex)) return;
		}
		const tableauCount = this.klondike.currentState.tableau.length;
		for (let i = 0; i < tableauCount; i++) {
			if (this.klondike.moveCard(waste, this.klondike.getTableauStack(i), topIndex)) return;
		}
	}

	private autoComplete(): void {
		switch (this.currentGame) {
			case GameType.KLONDIKE: {
				let moved = 0;
				do { moved = this.klondike.autoMoveToFoundations(); } while (moved > 0);
				break;
			}
			case GameType.FREECELL: {
				while (this.freeCell.autoMoveToFoundations()) {}
				break;
			}
			case GameType.CLOCK: this.clockSolitaire.playAll(); break;
		}
	}
}
