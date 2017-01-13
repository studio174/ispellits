// todo: confirm whether passing the entire state down is good/bad practice..

import React, { Component } from 'react';

// components
import { Header } from './Header';
import Body from './Body';
import Footer from './Footer';

// yeti states
import yetiHello from './images/yeti-hello.png';
import yetiLose from './images/yeti-lose.png';
import yetiWin from './images/yeti-win.png';

// test dictionary
// import dictionary from './data/test-dictionary';

// data
import dictionary from './data/dictionary';

// helpers
import client from './Client.js';

/** 
 * @description Represents a game of hangman
 * @extends Component
 */
class App extends Component {
  /**
   * @description Set the state of the application
   * @constructor
   * @param {object} props - application properties
   */
  constructor(props) {
    super(props);

    this.createClues = this.createClues.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.proceed = this.proceed.bind(this);
    this.updateWordBank = this.updateWordBank.bind(this);
    this.handleKeyboardClick = this.handleKeyboardClick.bind(this);
    this.updateGameState = this.updateGameState.bind(this);
    this.incrementScore = this.incrementScore.bind(this);
    this.decrementScore = this.decrementScore.bind(this);
    this.updateLives = this.updateLives.bind(this);
    this.bonusLife = this.bonusLife.bind(this);
    this.nextWord = this.nextWord.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.resetGame = this.resetGame.bind(this);

    this.state = {
      title: '',
      word: '',
      totalWords: 0,
      words: [],
      clues: [],
      clue: '',
      input: [],
      correct: [],
      pool: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
      yeti: yetiHello,
      roundScore: 0, // score for each round
      totalScore: 0, // running total
      bonusScore: 0, // score memory for bonus lives      
      lives: 1,
      modal: true, // show the modal
      startScreen: true, // display the start screen modal
      scoreScreen: false, // hide the score screen
      inputScreen: false, // hide the input screen
      highScoreScreen: false, // hide high score screen 
      validationError: false,
      highScores: [],
      name: '',
    };
  }

  componentDidMount() {
    // get data from "server" (flat file for now)
    this.loadWordsFromDictionary();
    this.loadCluesFromDictionary();
  }

  loadWordsFromDictionary() {
    const words = this.state.words;
    this.setState({
      totalWords: Object.keys(dictionary).length,
      words: [...words, ...Object.keys(dictionary)],
    });
  }

  loadCluesFromDictionary() {
    const clues = this.state.clues;
    this.setState({
      clues: [...clues, ...this.createClues(dictionary)],
    });
  }  

  createClues(dictionary) {
    let clues = [];
    for (let i in dictionary) {
      if (dictionary.hasOwnProperty(i)) {
        // TODO: confirm that this is still okay?
        clues.push(dictionary[i]);
      }
    }
    return clues;
  }

  /**
  * @function handleStartGame 
  * @description Starts the game by invoking the @proceed method
  * @returns {void}
  */
  handleStartGame() {
    this.proceed();
  }

  /**
  * @function handleKeyboardClick 
  * @description Handles keyboard input from user then invokes
  * the @updateGameState method
  * @param {number} index - index value of letter on keyboard
  * @returns {void}
  */
  handleKeyboardClick(index) {
    let input = this.state.pool[index];
    this.updateGameState(input);
  }

  handleNameChange(name) {
    this.setState({ name });
  }

  submitForm(name) {
    if (name === '') {
      this.setState({
        validationError: true,
      })
    } else {
      const playerData = {
        name,
        score: this.state.totalScore,
      };

      client.createPlayer(playerData,
        (err) => {
          // TODO: improve error message
          console.log(err);
        },
        client.getPlayers((data) => {
          this.setState({
            inputScreen: false, // hide the input screen
            highScoreScreen: true, // show the high score screen
            yeti: yetiWin,
            highScores: [...this.state.highScores, ...data],
          });
        }, (err) => {
          // TODO: improve this error message
          console.log(err);
        })
      );
    }
  }

  proceed() {
    this.updateWordBank();
    this.setState({
      correct: [], // from what I gather this is not mutating
      input: [], // from what I gather this is not mutating
      modal: false, // show the modal
      startScreen: false, // hide the start screen modal
      scoreScreen: false, // hide the score screen
      inputScreen: false, // hide the input screen
      roundScore: 0, // reset the round score
    });
  }

  updateWordBank() {
    let words = this.state.words;
    let clues = this.state.clues;

    // get the next word at random
    let nextWord = words[Math.floor(Math.random() * words.length)];
    const indexOfNextWord = words.indexOf(nextWord);

    // get the clue for the nextWord
    let clue = clues[indexOfNextWord];
    const indexofNextClue = clues.indexOf(clue);

    // reduce the number of totalWords
    const totalWords = this.state.totalWords - 1;

    // remove words and clues    
    const newWords = [
      ...words.slice(0, indexOfNextWord),
      ...words.slice(indexOfNextWord + 1)
    ];
    const newClues = [
      ...clues.slice(0, indexofNextClue),
      ...clues.slice(indexofNextClue + 1)
    ];    

    // update the state
    this.setState({
      words: newWords,
      word: nextWord,
      totalWords: totalWords,
      clues: newClues,
      clue: clue,
    });
  }

  updateGameState(input) {
    let word = this.state.word;

    // if the input is found
    if (word.indexOf(input) >= 0 && this.state.correct.indexOf(input) === -1) {
      // count the # of occurences in the word
      let count = (word.match(new RegExp(input, 'g')) || []).length;
      // TODO: find a better way to do this without looping...?
      let correctArr = [];
      for (let i = 0; i < count; i++) {
        correctArr = [...correctArr, input];
      }
      this.setState({
        correct: [...this.state.correct, ...correctArr],
        input: [...this.state.input, input],
        roundScore: this.incrementScore(10),
        yeti: yetiWin,
      }, () => {
        if (this.state.correct.length === this.state.word.length) {
          setTimeout(() => {
            this.updateLives(this.nextWord);
          }, 500);
        }
      });
    } else {
      if (this.state.input.indexOf(input) === -1) {
        this.setState({
          input: [...this.state.input, input],
          roundScore: this.decrementScore(2),
          yeti: yetiLose,
        });
      }
    }
  }

  incrementScore(n) {
    let score = this.state.roundScore;
    score += n;
    return score;
  }

  decrementScore(n) {
    let score = this.state.roundScore;
    score -= n;
    return score;
  }

  updateLives(cb) {
    let lives = this.state.lives;
    let totalScore = this.state.totalScore;
    let roundScore = this.state.roundScore;
    totalScore += roundScore;

    lives = this.bonusLife(totalScore, lives);

    if (this.state.correct.length === this.state.input.length) {
      lives++;
    } else if (this.state.input.length === 26) {
      lives--;
    }

    this.setState({
      lives: lives,
      totalScore: totalScore,
    }, () => {
      cb();
    });

  }

  bonusLife(totalScore, lives) {
    if (totalScore >= 100) {
      let score = this.state.bonusScore;
      if (totalScore - score >= 100) {
        lives++;
        score += 100;
      }
      this.setState({
        bonusScore: score
      });
    }
    return lives;
  }

  nextWord() {
    if (this.state.totalWords === 0) {
      /**
       * Player won, end game
       */
      this.setState({
        title: 'You beat the game!',
        modal: true, // show the modal
        inputScreen: true, // show the input screen
      });
    } else if (this.state.lives === 0) {
      /**
       * Player died, end game
       */
      this.setState({
        title: 'Game Over!',
        modal: true, // show the modal
        inputScreen: true, // show the input screen
      });
    } else {
      /**
       * End round
       */
      this.setState({
        yeti: yetiHello,
        modal: true, // show the modal
        scoreScreen: true, // show the score screen
      });
    }
  }

  // TODO: fix this up.. I feel like it's just bad...
  resetGame() {
    this.setState({
      title: '',
      word: '',
      totalWords: Object.keys(dictionary).length,
      words: Object.keys(dictionary),
      clues: this.createClues(dictionary),
      clue: '',
      input: [],
      correct: [],
      pool: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
      yeti: yetiHello,
      roundScore: 0, // score for each round
      totalScore: 0, // running total
      bonusScore: 0, // score memory for bonus lives      
      lives: 1,
      modal: true, // show the modal
      startScreen: true, // display the start screen modal
      scoreScreen: false, // hide the score screen
      inputScreen: false, // hide the input screen
      highScoreScreen: false, // hide high score screen 
      validationError: false,
      name: '',
    });
  }

  render() {
    return (
      <div className="App">
        <Header
          modal={this.state.modal}
          lives={this.state.lives}
          score={this.state.roundScore}
        />
        <Body
          state={this.state}
          handleStartGame={this.handleStartGame}
          handleClick={this.handleKeyboardClick}
          submitForm={this.submitForm}
          resetGame={this.resetGame}
          validationError={this.state.validationError}
          handleNameChange={this.handleNameChange}
        />
        <Footer yeti={this.state.yeti} />
      </div>
      );
  }
}

export default App;
