import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KlondikeBoardComponent } from './components/klondike-board/klondike-board.component';
import { SpiderBoardComponent } from './components/spider-board/spider-board.component';
import { FreeCellBoardComponent } from './components/freecell-board/freecell-board.component';

export enum GameType {
	KLONDIKE = 'Klondike',
	SPIDER = 'Spider',
	FREECELL = 'FreeCell'
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	imports: [CommonModule, KlondikeBoardComponent, SpiderBoardComponent, FreeCellBoardComponent]
})
export class AppComponent {
	title = 'Swarlehtaire';
	currentGame: GameType = GameType.KLONDIKE;
	GameType = GameType;
	gameTypes = [GameType.KLONDIKE, GameType.SPIDER, GameType.FREECELL];

	selectGame(game: GameType): void {
		this.currentGame = game;
	}
}
