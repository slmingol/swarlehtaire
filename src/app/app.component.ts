import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KlondikeBoardComponent } from './components/klondike-board/klondike-board.component';
import { SpiderBoardComponent } from './components/spider-board/spider-board.component';

export enum GameType {
	KLONDIKE = 'Klondike',
	SPIDER = 'Spider'
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	imports: [CommonModule, KlondikeBoardComponent, SpiderBoardComponent]
})
export class AppComponent {
	title = 'Swarlehtaire';
	currentGame: GameType = GameType.KLONDIKE;
	GameType = GameType;
	gameTypes = [GameType.KLONDIKE, GameType.SPIDER];

	selectGame(game: GameType): void {
		this.currentGame = game;
	}
}
