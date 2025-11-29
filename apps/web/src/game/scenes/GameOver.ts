import * as Phaser from 'phaser';

export default class GameOver extends Phaser.Scene {
  private finalScore = 0;
  private survivalTime = 0;
  private sandwichesCollected = 0;
  private cansCollected = 0;
  private starsCollected = 0;
  private enemiesDefeated = 0;
  private selectedOption = 0; // 0 = Play Again, 1 = Main Menu
  private playAgainText?: Phaser.GameObjects.Text;
  private mainMenuText?: Phaser.GameObjects.Text;
  private selector?: Phaser.GameObjects.Text;
  private upKey?: Phaser.Input.Keyboard.Key;
  private downKey?: Phaser.Input.Keyboard.Key;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameOver');
  }

  init(data: { score: number, time: number, sandwiches?: number, cans?: number, stars?: number, enemies?: number }) {
    this.finalScore = data.score || 0;
    this.survivalTime = data.time || 0;
    this.sandwichesCollected = data.sandwiches || 0;
    this.cansCollected = data.cans || 0;
    this.starsCollected = data.stars || 0;
    this.enemiesDefeated = data.enemies || 0;
    this.selectedOption = 0; // Reset selection

    // Reset UI references
    this.playAgainText = undefined;
    this.mainMenuText = undefined;
    this.selector = undefined;
  }

  create() {
    // Dispatch gameOver event to React layer for blockchain score submission
    console.log('[GameOver Scene] Dispatching gameOver event with score:', this.finalScore);
    window.dispatchEvent(new CustomEvent('gameOver', {
      detail: { score: this.finalScore }
    }));

    // Add game over background
    const bg = this.add.image(320, 480, 'game_over_bg');
    bg.setDisplaySize(640, 960);

    // Add semi-transparent black rectangle for results area
    const resultsBg = this.add.graphics();
    resultsBg.fillStyle(0x000000, 0.6);
    resultsBg.fillRoundedRect(60, 280, 520, 450, 15);

    // Game Over text
    const gameOverText = this.add.text(320, 200, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '40px',
      color: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);
    gameOverText.setShadow(3, 3, '#000000', 5, true, true);

    // Results text
    const resultsText = this.add.text(320, 320, 'RESULTS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    resultsText.setShadow(2, 2, '#000000', 4, true, true);

    // Stats display
    const finalScoreText = this.add.text(320, 400, `SCORE: ${Math.floor(this.finalScore)}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    finalScoreText.setShadow(2, 2, '#000000', 3, true, true);

    // Survival time
    const minutes = Math.floor(this.survivalTime / 60000);
    const seconds = Math.floor((this.survivalTime % 60000) / 1000);
    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const timeTextEl = this.add.text(320, 450, `TIME: ${timeText}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    timeTextEl.setShadow(2, 2, '#000000', 3, true, true);

    // Enemies defeated
    const enemiesText = this.add.text(320, 495, `ENEMIES: ${this.enemiesDefeated}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    enemiesText.setShadow(2, 2, '#000000', 3, true, true);

    // Sandwiches collected
    const sandwichesText = this.add.text(320, 535, `SANDWICHES: ${this.sandwichesCollected}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    sandwichesText.setShadow(2, 2, '#000000', 3, true, true);

    // Energy drinks collected
    const energyText = this.add.text(320, 575, `ENERGY DRINKS: ${this.cansCollected}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    energyText.setShadow(2, 2, '#000000', 3, true, true);

    // Stars collected
    const starsText = this.add.text(320, 620, `STARS: ${this.starsCollected}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    starsText.setShadow(2, 2, '#000000', 3, true, true);

    // Menu options
    this.playAgainText = this.add.text(320, 750, 'PLAY AGAIN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.playAgainText.setShadow(2, 2, '#000000', 3, true, true);
    this.playAgainText.setInteractive({ useHandCursor: true });
    this.playAgainText.on('pointerdown', () => this.playAgain());
    this.playAgainText.on('pointerover', () => {
      this.selectedOption = 0;
      this.updateSelection();
    });

    this.mainMenuText = this.add.text(320, 810, 'MAIN MENU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.mainMenuText.setShadow(2, 2, '#000000', 3, true, true);
    this.mainMenuText.setInteractive({ useHandCursor: true });
    this.mainMenuText.on('pointerdown', () => this.goToMainMenu());
    this.mainMenuText.on('pointerover', () => {
      this.selectedOption = 1;
      this.updateSelection();
    });

    // Selector
    this.selector = this.add.text(120, 750, '▶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffff00'
    });

    // Input
    this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.updateSelection();
  }

  update() {
    // Handle keyboard navigation
    if (Phaser.Input.Keyboard.JustDown(this.upKey!)) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.downKey!)) {
      this.selectedOption = Math.min(1, this.selectedOption + 1);
      this.updateSelection();
    }

    // Handle selection
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey!) || Phaser.Input.Keyboard.JustDown(this.enterKey!)) {
      if (this.selectedOption === 0) {
        this.playAgain();
      } else if (this.selectedOption === 1) {
        this.goToMainMenu();
      }
    }
  }

  private updateSelection() {
    if (!this.playAgainText || !this.mainMenuText || !this.selector) return;

    // Reset all colors
    this.playAgainText.setColor('#ffffff');
    this.mainMenuText.setColor('#ffffff');

    // Highlight selected
    const yPositions = [750, 810];
    this.selector.setPosition(120, yPositions[this.selectedOption]);

    if (this.selectedOption === 0) {
      this.playAgainText.setColor('#ffff00');
    } else if (this.selectedOption === 1) {
      this.mainMenuText.setColor('#ffff00');
    }
  }

  private playAgain() {
    this.scene.start('CharacterSelect');
  }

  private goToMainMenu() {
    this.scene.start('MainMenu');
  }
}
