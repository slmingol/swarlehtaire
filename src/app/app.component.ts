import { Component } from '@angular/core';
import { KlondikeBoardComponent } from './components/klondike-board/klondike-board.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	imports: [KlondikeBoardComponent]
})
export class AppComponent {
	title = 'Swarlehtaire - Klondike Solitaire';
}
