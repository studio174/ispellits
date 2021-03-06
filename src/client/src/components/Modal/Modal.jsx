import React from 'react';

// components
import Score from '../Score/Score';
import InputForm from '../InputForm/InputForm';
import Btn from '../Btn/Btn';

import './Modal.css';

const Modal = function(props) {
  if (props.startScreen) {
    return (<ModalBody>
              <Btn handleClick={props.proceed} btnText="Start" />
            </ModalBody>);
  } else if (props.scoreScreen) {
    return (<ModalBody title="Good Job!" body="You're doing great, keep it up.">
              <Score
                styles="modal__body"
                score={props.roundScore}
                text="Round Score: "
              />
              <Score
                styles="modal__body"
                score={props.totalScore}
                text="Total Score: "
              />
              <Btn handleClick={props.proceed} btnText="Next Word" />
            </ModalBody>);
  } else if (props.inputScreen) {
    return (<ModalBody title={props.title} body="Input your name to enter the hall of fame.">
              <InputForm
                submitForm={props.submitForm}
                handleNameChange={props.handleNameChange}
                handleFormSubmit={props.handleFormSubmit}
              />
            </ModalBody>);
  } else if (props.highScoreScreen) {
    return (<ModalBody
              title="Hall of Fame"
              body=""
              highScores={props.highScores}
            >
              <Btn handleClick={props.resetGame} btnText="Play again" />
            </ModalBody>);
  }
};

const ModalBody = function(props) {
  const scores = (props.highScores ? props.highScores.map((player) => {
    return (
      <li className="scores__player" key={player._id}>
        {player.name}<span className="scores__score">{player.score} pts</span>
      </li>
      );
  }) : '');
  const highScores = (props.highScores ? <ol className="scores">
                                           {scores}
                                         </ol> : '');
  return (
    <div className="modal">
      <h1 className="modal__title">{props.title}</h1>
      <p className="modal__body">
        {props.body}
      </p>
      {highScores}
      {props.children}
    </div>
    );
};
ModalBody.propTypes = {
  title: React.PropTypes.string.isRequired,
  body: React.PropTypes.string.isRequired,
  btnText: React.PropTypes.string.isRequired,
};
ModalBody.defaultProps = {
  title: 'Game Rules',
  body: 'Try and guess the word based on the given clue. Guess incorrectly and lose a life. Run out of lives and the game ends. New lives are rewarded for every 100 points you accumulate.',
  btnText: 'Start',
};

export { ModalBody, Modal };
